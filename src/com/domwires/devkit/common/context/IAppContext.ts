/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unused-vars */

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
    IMediator,
    IMediatorContainer,
    IMediatorImmutable,
    IMessage,
    IMessageDispatcher,
    IModel,
    IModelContainer,
    IModelImmutable,
    instanceOf, MappingConfig,
    MappingConfigList,
    MessageType,
    Type
} from "domwires";
import {inject, named, optional} from "inversify";
import {IUIMediator, UIMediator, UIMediatorMessageType} from "../mediator/IUIMediator";
import {IInputView} from "../view/IInputView";
import {ExecuteCliCommand} from "../command/ExecuteCliCommand";
import {IsCliCommandGuards} from "../command/guards/IsCliCommandGuards";
import {DwError} from "../DwError";
import {IService, IServiceImmutable} from "../service/IService";
import {Types} from "../Types";
import {FactoryNames} from "../FactoryNames";

export interface IAppContextImmutable extends IContextImmutable
{
    get id(): string;
}

export interface IAppContext extends IAppContextImmutable, IContext
{
    getContext<T extends IContext>(type: Type<T>, name?: string): T;

    getContext<T extends IContext>(type: Type<T>, immutableType: Type<IContextImmutable>, name?: string): T;

    getModel<T extends IModel>(type: Type<T>, name?: string): T;

    getModel<T extends IModel>(type: Type<T>, immutableType: Type<IModelImmutable>, name?: string): T;

    getService<T extends IService>(type: Type<T>, name?: string): T;

    getService<T extends IService>(type: Type<T>, immutableType: Type<IServiceImmutable>, name?: string): T;

    getMediator<T extends IMediator>(type: Type<T>, name?: string): T;

    getMediator<T extends IMediator>(type: Type<T>, immutableType: Type<IMediatorImmutable>, name?: string): T;

    mapContextToType(type: Type<IContext>, to: Class<IContext>, name?: string): IAppContext;

    mapModelToType(type: Type<IModel>, to: Class<IModel>, name?: string): IAppContext;

    mapServiceToType(type: Type<IService>, to: Class<IService>, name?: string): IAppContext;

    mapMediatorToType(type: Type<IMediator>, to: Class<IMediator>, name?: string): IAppContext;

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
}

export class AppContext extends AbstractContext implements IAppContext
{
    private static readonly ADD_ERROR: string = "Use 'add' method instead";
    private static readonly REMOVE_ERROR: string = "Use 'remove' method instead";

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

    protected _id!: string;

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

    public override handleMessage<TData>(message: IMessage, data?: TData): IMessageDispatcher
    {
        super.handleMessage(message, data);

        if (instanceOf(message.initialTarget, "IModel"))
        {
            if (this.appContextConfig.forwardMessageFromModelsToContexts)
            {
                this.dispatchMessageToContexts(message, data);
            }
        }
        else if (instanceOf(message.initialTarget, "IMediator"))
        {
            if (this.appContextConfig.forwardMessageFromMediatorsToContexts)
            {
                this.dispatchMessageToContexts(message, data);
            }
        }

        return this;
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

    public get id(): string
    {
        return this._id;
    }

    protected createFactories(): {
        contextFactory: IFactory; modelFactory: IFactory; serviceFactory: IFactory;
        mediatorFactory: IFactory; viewFactory: IFactory;
    }
    {
        if (!this._contextFactory)
        {
            this._contextFactory = new Factory(this.logger);
            this._modelFactory = new Factory(this.logger);
            this._serviceFactory = new Factory(this.logger);
            this._mediatorFactory = new Factory(this.logger);
            this._viewFactory = new Factory(this.logger);

            if (this.factoriesConfig)
            {
                if (this.factoriesConfig.contextFactory) this._contextFactory.appendMappingConfig(this.factoriesConfig.contextFactory);
                if (this.factoriesConfig.modelFactory) this._modelFactory.appendMappingConfig(this.factoriesConfig.modelFactory);
                if (this.factoriesConfig.serviceFactory) this._serviceFactory.appendMappingConfig(this.factoriesConfig.serviceFactory);
                if (this.factoriesConfig.mediatorFactory) this._mediatorFactory.appendMappingConfig(this.factoriesConfig.mediatorFactory);
                if (this.factoriesConfig.viewFactory) this._viewFactory.appendMappingConfig(this.factoriesConfig.viewFactory);
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

    public override add(child: IHierarchyObject, index?: number): boolean
    {
        let success = false;

        if (instanceOf(child, "IContext"))
        {
            success = !this.modelContainer.contains(child);
            super.addModel(<IContext>child);

            return success;
        }

        if (instanceOf(child, "IModelContainer") || instanceOf(child, "IMediatorContainer"))
        {
            return super.add(child, index);
        }

        if (instanceOf(child, "IModel"))
        {
            success = !this.modelContainer.contains(child);
            super.addModel(child);
        }
        else if (instanceOf(child, "IMediator"))
        {
            success = !this.mediatorContainer.contains(child);
            super.addMediator(child);
        }

        return success;
    }

    public override remove(child: IHierarchyObject, dispose?: boolean): boolean
    {
        let success = false;

        if (instanceOf(child, "IContext"))
        {
            success = this.modelContainer.contains(child);
            super.removeModel(<IContext>child);

            return success;
        }

        if (instanceOf(child, "IModelContainer") || instanceOf(child, "IMediatorContainer"))
        {
            return super.remove(child, dispose);
        }

        if (instanceOf(child, "IModel"))
        {
            success = this.modelContainer.contains(child);
            super.removeModel(child);
        }
        else if (instanceOf(child, "IMediator"))
        {
            success = this.mediatorContainer.contains(child);
            super.removeMediator(child);
        }

        return success;
    }

    public override addModel(model: IModel): IModelContainer
    {
        throw new Error(AppContext.ADD_ERROR);
    }

    public override addMediator(mediator: IMediator): IMediatorContainer
    {
        throw new Error(AppContext.ADD_ERROR);
    }

    public override removeModel(model: IModel, dispose?: boolean): IModelContainer
    {
        throw new Error(AppContext.REMOVE_ERROR);
    }

    public override removeMediator(mediator: IMediator, dispose?: boolean): IMediatorContainer
    {
        throw new Error(AppContext.REMOVE_ERROR);
    }

    public getContext<T extends IContext>(type: Type<T>, immutableType?: Type<IContextImmutable>, name?: string): T
    {
        return this.getInstance(this._contextFactory, type, immutableType, name);
    }

    public getService<T extends IService>(type: Type<T>, immutableType?: Type<IServiceImmutable>, name?: string): T
    {
        return this.getInstance<T>(this._serviceFactory, type, immutableType, name);
    }

    public getModel<T extends IModel>(type: Type<T>, immutableType?: Type<IModelImmutable>, name?: string): T
    {
        return this.getInstance(this._modelFactory, type, immutableType, name);
    }

    public getMediator<T extends IMediator>(type: Type<T>, immutableType?: Type<IMediatorImmutable>, name?: string): T
    {
        return this.getInstance(this._mediatorFactory, type, immutableType, name);
    }

    private getInstance<T>(factory: IFactoryImmutable, type: Type<T>, immutableType?: Type, name?: string): T
    {
        const instance: T = factory.getInstance(type, name);

        if (instanceOf(instance, "IContext"))
        {
            if (immutableType) this._contextFactory.mapToValue(immutableType, instance, name);
        }
        else if (instanceOf(instance, "IService"))
        {
            this._contextFactory.mapToValue(type, instance, name);
            this.factory.mapToValue(type, instance, name);
        }
        else if (instanceOf(instance, "IModel"))
        {
            this._contextFactory.mapToValue(type, instance, name);
            if (immutableType) this._mediatorFactory.mapToValue(immutableType, instance, name);
            if (immutableType) this._serviceFactory.mapToValue(immutableType, instance, name);
            this.factory.mapToValue(type, instance, name);
        }
        else if (instanceOf(instance, "IMediator"))
        {
            this._contextFactory.mapToValue(type, instance, name);
        }

        return instance;
    }

    public mapContextToType(type: Type<IContext>, to: Class<IContext>, name?: string): IAppContext
    {
        this._contextFactory.mapToType(type, to, name);

        return this;
    }

    public mapMediatorToType(type: Type<IMediator>, to: Class<IMediator>, name?: string): IAppContext
    {
        this._mediatorFactory.mapToType(type, to, name);

        return this;
    }

    public mapModelToType(type: Type<IModel>, to: Class<IModel>, name?: string): IAppContext
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
            this.add(this.defaultUiMediator);
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
        if (this._id)
        {
            this.factory.mapToValue("string", this._id, "commandMapperId");
        }

        this.factory.mapToValue(Types.ICommandMapper, this);
    }
}