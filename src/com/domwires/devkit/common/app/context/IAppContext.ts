import {
    AbstractContext,
    Class,
    ContextConfig,
    ContextConfigBuilder,
    Enum,
    Factory,
    FactoryConfig,
    ICommand,
    IContext,
    IContextImmutable,
    IFactory,
    IFactoryImmutable,
    IHierarchyObject,
    IHierarchyObjectImmutable,
    IMessage,
    instanceOf,
    MappingConfig,
    MappingConfigList,
    MessageType,
    Type
} from "domwires";
import {inject, named, optional} from "inversify";
import {IUIMediator, UIMediator, UIMediatorMessageType} from "../mediator/IUIMediator";
import {IInputView} from "../view/IInputView";
import {ExecuteCliCommand} from "../command/ExecuteCliCommand";
import {IsCliCommandGuards} from "../command/guards/IsCliCommandGuards";
import {DwError} from "../../DwError";
import {IService, IServiceImmutable} from "../../service/IService";
import {Types} from "../../Types";
import {FactoryNames} from "../../FactoryNames";
import {serviceIdentifier} from "domwires/dist/com/domwires/core/Decorators";

export interface IAppContextImmutable extends IContextImmutable
{
}

export interface IAppContext extends IAppContextImmutable, IContext
{
    getContextInstance<T extends IContext>(type: Type<T>, name?: string): T;

    getContextInstance<T extends IContext>(type: Type<T>, immutableType: Type<IContextImmutable>, name?: string): T;

    getModelInstance<T extends IHierarchyObject>(type: Type<T>, name?: string): T;

    getModelInstance<T extends IHierarchyObject>(type: Type<T>, immutableType: Type<IHierarchyObjectImmutable>, name?: string): T;

    getServiceInstance<T extends IService>(type: Type<T>, name?: string): T;

    getServiceInstance<T extends IService>(type: Type<T>, immutableType: Type<IServiceImmutable>, name?: string): T;

    getMediatorInstance<T extends IHierarchyObject>(type: Type<T>, name?: string): T;

    getMediatorInstance<T extends IHierarchyObject>(type: Type<T>, immutableType: Type<IHierarchyObjectImmutable>, name?: string): T;

    mapContextToType(type: Type<IContext>, to: Class<IContext>, name?: string): IAppContext;

    mapModelToType(type: Type<IHierarchyObject>, to: Class<IHierarchyObject>, name?: string): IAppContext;

    mapServiceToType(type: Type<IService>, to: Class<IService>, name?: string): IAppContext;

    mapMediatorToType(type: Type<IHierarchyObject>, to: Class<IHierarchyObject>, name?: string): IAppContext;

    dispatchMessageToContexts<TData>(message: IMessage, data?: TData): IContext;
}

export type FactoriesConfig = {
    readonly contextFactory?: FactoryConfig;
    readonly modelFactory?: FactoryConfig;
    readonly serviceFactory?: FactoryConfig;
    readonly mediatorFactory?: FactoryConfig;
    readonly viewFactory?: FactoryConfig;
};

export type AppContextConfig = ContextConfig & {
    readonly forwardMessageFromMediatorsToContexts: boolean;
    readonly forwardMessageFromModelsToContexts: boolean;
    readonly defaultCliUI?: boolean;
};

export class AppContextConfigBuilder extends ContextConfigBuilder
{
    public forwardMessageFromMediatorsToContexts = true;
    public forwardMessageFromModelsToContexts = true;
    public defaultCliUI = false;

    public override build(): AppContextConfig
    {
        const contextConfig = super.build();

        return {
            forwardMessageFromMediatorsToMediators: contextConfig.forwardMessageFromMediatorsToMediators,
            forwardMessageFromMediatorsToModels: contextConfig.forwardMessageFromMediatorsToModels,
            forwardMessageFromModelsToModels: contextConfig.forwardMessageFromModelsToModels,
            forwardMessageFromModelsToMediators: contextConfig.forwardMessageFromModelsToMediators,
            forwardMessageFromMediatorsToContexts: this.forwardMessageFromMediatorsToContexts,
            forwardMessageFromModelsToContexts: this.forwardMessageFromModelsToContexts,
            defaultCliUI: this.defaultCliUI
        };
    }
}

export class AppContextMessageType extends MessageType
{
    public static readonly READY: AppContextMessageType = new AppContextMessageType();
    public static readonly DISPOSED: AppContextMessageType = new AppContextMessageType();
}

@serviceIdentifier(Types.IAppContext)
export class AppContext extends AbstractContext implements IAppContext
{
    @inject(Types.FactoriesConfig) @optional()
    private factoriesConfig!: FactoriesConfig;

    @inject(Types.ContextConfig) @optional()
    private appContextConfig!: AppContextConfig;

    @inject(Types.IFactory) @named(FactoryNames.CONTEXT) @optional()
    private _contextFactory!: IFactory;

    @inject(Types.IFactory) @named(FactoryNames.MODEL) @optional()
    private _modelFactory!: IFactory;

    @inject(Types.IFactory) @named(FactoryNames.SERVICE) @optional()
    private _serviceFactory!: IFactory;

    @inject(Types.IFactory) @named(FactoryNames.MEDIATOR) @optional()
    private _mediatorFactory!: IFactory;

    @inject(Types.IFactory) @named(FactoryNames.VIEW) @optional()
    private _viewFactory!: IFactory;

    protected defaultUiMediator!: IUIMediator;

    protected override init()
    {
        super.init();

        if (!this.appContextConfig)
        {
            this.appContextConfig = new AppContextConfigBuilder().build();
        }

        this.createFactories();

        this._mapTypes();
        this._mapFactories();
        this._createInstances();
        this._mapValues();
        this._mapCommands();
    }

    protected ready(): void
    {
        this.dispatchMessage(AppContextMessageType.READY);
    }

    public override dispose(): void
    {
        this.disposeComplete();
    }

    protected disposeComplete(): void
    {
        this.dispatchMessage(AppContextMessageType.DISPOSED);

        super.dispose();
    }

    protected override forwardMessageFromModel<DataType>(message: IMessage, data?: DataType): void
    {
        super.forwardMessageFromModel(message, data);

        if (this.appContextConfig.forwardMessageFromModelsToContexts)
        {
            this.dispatchMessageToContexts(message, data);
        }
    }

    protected override forwardMessageFromMediator<DataType>(message: IMessage, data?: DataType): void
    {
        super.forwardMessageFromMediator(message, data);

        if (this.appContextConfig.forwardMessageFromMediatorsToContexts)
        {
            this.dispatchMessageToContexts(message, data);
        }
    }

    public dispatchMessageToContexts<TData>(message: IMessage, data?: TData): IContext
    {
        const filter = (child: IHierarchyObject) =>
        {
            return instanceOf(child, "IContext");
        };

        return super.dispatchMessageToModels(message, data, filter);
    }

    public override dispatchMessageToModels<TData>(message: IMessage, data?: TData, filter?: (child: IHierarchyObject) => boolean): IContext
    {
        if (!filter)
        {
            filter = (child: IHierarchyObject) =>
            {
                return !instanceOf(child, "IContext");
            };
        }

        return super.dispatchMessageToModels(message, data, filter);
    }

    protected createFactories(): {
        contextFactory: IFactory; modelFactory: IFactory; serviceFactory: IFactory;
        mediatorFactory: IFactory; viewFactory: IFactory;
    }
    {
        const toMap = (config: FactoryConfig): FactoryConfig =>
        {
            if (config instanceof Map)
            {
                return config;
            }

            return new Map(Object.entries(config));
        };

        if (!this._contextFactory)
        {
            this._contextFactory = new Factory(this.logger);
            this._modelFactory = new Factory(this.logger);
            this._serviceFactory = new Factory(this.logger);
            this._mediatorFactory = new Factory(this.logger);
            this._viewFactory = new Factory(this.logger);

            if (this.factoriesConfig)
            {
                if (this.factoriesConfig.contextFactory) this._contextFactory.appendMappingConfig(toMap(this.factoriesConfig.contextFactory));
                if (this.factoriesConfig.modelFactory) this._modelFactory.appendMappingConfig(toMap(this.factoriesConfig.modelFactory));
                if (this.factoriesConfig.serviceFactory) this._serviceFactory.appendMappingConfig(toMap(this.factoriesConfig.serviceFactory));
                if (this.factoriesConfig.mediatorFactory) this._mediatorFactory.appendMappingConfig(toMap(this.factoriesConfig.mediatorFactory));
                if (this.factoriesConfig.viewFactory) this._viewFactory.appendMappingConfig(toMap(this.factoriesConfig.viewFactory));
            }
        }

        return {
            contextFactory: this._contextFactory,
            modelFactory: this._modelFactory,
            serviceFactory: this._serviceFactory,
            mediatorFactory: this._mediatorFactory,
            viewFactory: this._viewFactory
        };
    }

    public getContextInstance<T extends IContext>(type: Type<T>, immutableType?: Type<IContextImmutable>, name?: string): T
    {
        return this.getInstance(this._contextFactory, type, immutableType, name);
    }

    public getServiceInstance<T extends IService>(type: Type<T>, immutableType?: Type<IServiceImmutable>, name?: string): T
    {
        return this.getInstance<T>(this._serviceFactory, type, immutableType, name);
    }

    public getModelInstance<T extends IHierarchyObject>(type: Type<T>, immutableType?: Type<IHierarchyObjectImmutable>, name?: string): T
    {
        return this.getInstance(this._modelFactory, type, immutableType, name);
    }

    public getMediatorInstance<T extends IHierarchyObject>(type: Type<T>, immutableType?: Type<IHierarchyObjectImmutable>, name?: string): T
    {
        return this.getInstance(this._mediatorFactory, type, immutableType, name);
    }

    private getInstance<T>(factory: IFactoryImmutable, type: Type<T>, immutableType?: Type, name?: string): T
    {
        const instance: T = factory.getInstance(type, name);

        if (instanceOf(instance, "IContext"))
        {
            if (immutableType) this._contextFactory.mapToValue(immutableType, instance, name);
            this.factory.mapToValue(type, instance, name);
        }
        else if (instanceOf(instance, "IService"))
        {
            this._contextFactory.mapToValue(type, instance, name);
            this.factory.mapToValue(type, instance, name);
        }
        else if (instanceOf(instance, "IHierarchyObject"))
        {
            if (factory === this._modelFactory)
            {
                this._contextFactory.mapToValue(type, instance, name);
                if (immutableType) this._mediatorFactory.mapToValue(immutableType, instance, name);
                if (immutableType) this._serviceFactory.mapToValue(immutableType, instance, name);
                this.factory.mapToValue(type, instance, name);
            }
            else if (factory === this._mediatorFactory)
            {
                this._contextFactory.mapToValue(type, instance, name);
            }
        }

        return instance;
    }

    public mapContextToType(type: Type<IContext>, to: Class<IContext>, name?: string): IAppContext
    {
        this._contextFactory.mapToType(type, to, name);

        return this;
    }

    public mapMediatorToType(type: Type<IHierarchyObject>, to: Class<IHierarchyObject>, name?: string): IAppContext
    {
        this._mediatorFactory.mapToType(type, to, name);

        return this;
    }

    public mapModelToType(type: Type<IHierarchyObject>, to: Class<IHierarchyObject>, name?: string): IAppContext
    {
        this._modelFactory.mapToType(type, to, name);

        return this;
    }

    public mapServiceToType(type: Type<IService>, to: Class<IService>, name?: string): IAppContext
    {
        this._serviceFactory.mapToType(type, to, name);

        return this;
    }

    private _createInstances(): void
    {
        if (this.appContextConfig.defaultCliUI)
        {
            this.defaultUiMediator = this._mediatorFactory.getInstance<IUIMediator>(Types.IUIMediator);
            this.addMediator(this.defaultUiMediator);
        }
    }

    private _mapTypes(): void
    {
        if (this.appContextConfig.defaultCliUI)
        {
            this._mediatorFactory.mapToType<IUIMediator>(Types.IUIMediator, this.defaultUIMediatorClass);
            this._viewFactory.mapToType<IInputView>(Types.IInputView, this.defaultUIViewClass);
        }
    }

    protected get defaultUIMediatorClass(): Class<IUIMediator>
    {
        return UIMediator;
    }

    protected get defaultUIViewClass(): Class<IInputView>
    {
        throw new Error(DwError.OVERRIDE.name);
    }

    private _mapCommands(): void
    {
        this.map(UIMediatorMessageType.INPUT, ExecuteCliCommand).addGuards(IsCliCommandGuards);
    }

    public override map<T>(messageType: Enum, commandClass: Class<ICommand>, data?: T, stopOnExecute?: boolean, once?: boolean): MappingConfig<T>;
    public override map<T>(messageType: Enum, commandClassList: Class<ICommand>[], data?: T, stopOnExecute?: boolean, once?: boolean): MappingConfigList<T>;
    public override map<T>(messageTypeList: Enum[], commandClass: Class<ICommand>, data?: T, stopOnExecute?: boolean, once?: boolean): MappingConfigList<T>;
    public override map<T>(messageTypeList: Enum[], commandClassList: Class<ICommand>[], data?: T, stopOnExecute?: boolean, once?: boolean): MappingConfigList<T>;
    public override map<T>(messageType: Enum | Enum[], commandClass: Class<ICommand> | Class<ICommand>[], data?: T, stopOnExecute?: boolean, once?: boolean): MappingConfig<T> | MappingConfigList<T>;
    public override map<T>(messageType: Enum | Enum[], commandClass: Class<ICommand> | Class<ICommand>[], data?: T, stopOnExecute = true, once = false): MappingConfig<T> | MappingConfigList<T>
    {
        return super.map(messageType, commandClass, data, stopOnExecute, once);
    }

    private _mapFactories(): void
    {
        this._contextFactory.mapToValue(Types.IFactory, this._contextFactory, FactoryNames.CONTEXT);
        this._contextFactory.mapToValue(Types.IFactory, this._modelFactory, FactoryNames.MODEL);
        this._contextFactory.mapToValue(Types.IFactory, this._serviceFactory, FactoryNames.SERVICE);
        this._contextFactory.mapToValue(Types.IFactory, this._mediatorFactory, FactoryNames.MEDIATOR);
        this._contextFactory.mapToValue(Types.IFactory, this._viewFactory, FactoryNames.VIEW);

        this._modelFactory.mapToValue(Types.IFactoryImmutable, this._modelFactory, FactoryNames.MODEL);

        this._mediatorFactory.mapToValue(Types.IFactoryImmutable, this._viewFactory, FactoryNames.VIEW);
    }

    private _mapValues(): void
    {
        if (this.id)
        {
            this.factory.mapToValue(Types.string, this.id, "commandMapperId");
        }

        this.factory.mapToValue(Types.ICommandMapper, this);
    }
}