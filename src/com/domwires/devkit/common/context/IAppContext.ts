/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
    AbstractContext,
    Class,
    ContextConfig, ContextConfigBuilder,
    Factory,
    IContext,
    IContextImmutable,
    IFactory,
    IFactoryImmutable,
    IHierarchyObject,
    IMediator,
    IMediatorContainer,
    IMessage,
    IMessageDispatcher,
    IModel,
    IModelContainer,
    instanceOf,
    Type
} from "domwires";
import {inject, named, optional} from "inversify";
import {DW_TYPES, FACTORIES_NAMES} from "../dw_consts";
import {IUIMediator, UIMediator, UIMediatorMessageType} from "../mediator/IUIMediator";
import {IInputView} from "../view/IInputView";
import {ExecuteCliCommand} from "../command/ExecuteCliCommand";
import {IsCliCommandGuards} from "../command/guards/IsCliCommandGuards";
import {DwError} from "../DwError";

export interface IAppContextImmutable extends IContextImmutable
{
    get id(): string;
}

export interface IAppContext extends IAppContextImmutable, IContext
{
    getInstance<T>(factory: IFactoryImmutable, type: Type<T>, immutableType: Type, name?: string): T;

    dispatchMessageToContexts<DataType>(message: IMessage, data?: DataType): IContext;
}

export type AppContextConfig = ContextConfig & {
    readonly forwardMessageFromMediatorsToContexts: boolean;
    readonly forwardMessageFromModelsToContexts: boolean;
    readonly defaultCliUI?: boolean;
};

export class AppContextConfigBuilder extends ContextConfigBuilder
{
    public forwardMessageFromMediatorsToContexts = true;
    public forwardMessageFromModelsToContexts = false;
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

export class AppContext extends AbstractContext implements IAppContext
{
    private static readonly ADD_ERROR: string = "Use 'add' method instead";
    private static readonly REMOVE_ERROR: string = "Use 'remove' method instead";

    @inject(DW_TYPES.AppContextConfig) @optional()
    private appContextConfig!: AppContextConfig;

    @inject(DW_TYPES.IFactory) @named(FACTORIES_NAMES.CONTEXT) @optional()
    protected contextFactory!: IFactory;

    @inject(DW_TYPES.IFactory) @named(FACTORIES_NAMES.MODEL) @optional()
    protected modelFactory!: IFactory;

    @inject(DW_TYPES.IFactory) @named(FACTORIES_NAMES.MEDIATOR) @optional()
    protected mediatorFactory!: IFactory;

    @inject(DW_TYPES.IFactory) @named(FACTORIES_NAMES.VIEW) @optional()
    protected viewFactory!: IFactory;

    protected defaultUiMediator!: IUIMediator;

    protected _id!: string;

    protected override init()
    {
        super.init();

        if (!this.appContextConfig)
        {
            this.appContextConfig = new AppContextConfigBuilder().build();
        }

        if (!this.contextFactory)
        {
            this.createFactories();
        }

        this.mapTypes();
        this.mapFactories();
        this.createInstances();
        this.mapValues();
        this.mapCommands();
    }

    public override handleMessage<DataType>(message: IMessage, data?: DataType): IMessageDispatcher
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

    public dispatchMessageToContexts<DataType>(message: IMessage, data?: DataType): IContext
    {
        const filter = (child: IHierarchyObject) =>
        {
            return instanceOf(child, "IContext");
        };

        return super.dispatchMessageToModels(message, data, filter);
    }

    public override dispatchMessageToModels<DataType>(message: IMessage, data?: DataType, filter?: (child: IHierarchyObject) => boolean): IContext
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

    protected createFactories()
    {
        this.contextFactory = new Factory(this.logger);
        this.modelFactory = new Factory(this.logger);
        this.mediatorFactory = new Factory(this.logger);
        this.viewFactory = new Factory(this.logger);
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

    public getInstance<T>(factory: IFactoryImmutable, type: Type<T>, immutableType: Type, name?: string): T
    {
        const instance: T = factory.getInstance(type, name);

        if (instanceOf(instance, "IContext"))
        {
            this.contextFactory.mapToValue(immutableType, instance, name);
        }
        else if (instanceOf(instance, "IModel"))
        {
            this.contextFactory.mapToValue(type, instance, name);
            this.mediatorFactory.mapToValue(immutableType, instance, name);
            this.modelFactory.mapToValue(immutableType, instance, name);
            this.factory.mapToValue(type, instance, name);
        }
        else if (instanceOf(instance, "IMediator"))
        {
            this.contextFactory.mapToValue(type, instance, name);
        }

        return instance;
    }

    protected createInstances(): void
    {
        if (this.appContextConfig.defaultCliUI)
        {
            this.defaultUiMediator = this.mediatorFactory.getInstance<IUIMediator>(DW_TYPES.IUIMediator);
            this.add(this.defaultUiMediator);
        }
    }

    protected mapTypes(): void
    {
        if (this.appContextConfig.defaultCliUI)
        {
            this.mediatorFactory.mapToType<IUIMediator>(DW_TYPES.IUIMediator, this.defaultUIMediatorClass);
            this.viewFactory.mapToType<IInputView>(DW_TYPES.IInputView, this.defaultUIViewClass);
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

    protected mapCommands(): void
    {
        this.map(UIMediatorMessageType.INPUT, ExecuteCliCommand).addGuards(IsCliCommandGuards);
    }

    private mapFactories(): void
    {
        this.contextFactory.mapToValue(DW_TYPES.IFactory, this.contextFactory, FACTORIES_NAMES.CONTEXT);
        this.contextFactory.mapToValue(DW_TYPES.IFactory, this.modelFactory, FACTORIES_NAMES.MODEL);
        this.contextFactory.mapToValue(DW_TYPES.IFactory, this.mediatorFactory, FACTORIES_NAMES.MEDIATOR);
        this.contextFactory.mapToValue(DW_TYPES.IFactory, this.viewFactory, FACTORIES_NAMES.VIEW);

        this.modelFactory.mapToValue(DW_TYPES.IFactoryImmutable, this.modelFactory, FACTORIES_NAMES.MODEL);

        this.mediatorFactory.mapToValue(DW_TYPES.IFactoryImmutable, this.viewFactory, FACTORIES_NAMES.VIEW);
    }

    protected mapValues(): void
    {
        if (this._id)
        {
            this.factory.mapToValue("string", this._id, "commandMapperId");
        }

        this.factory.mapToValue(DW_TYPES.ICommandMapper, this);
    }
}