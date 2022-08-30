/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
    AbstractContext,
    ContextConfig,
    Factory,
    IContext,
    IContextImmutable,
    IFactory,
    IFactoryImmutable,
    IHierarchyObject,
    IMediator,
    IMediatorContainer,
    IModel,
    IModelContainer,
    instanceOf,
    Type
} from "domwires";
import {inject, named, optional} from "inversify";
import {DW_TYPES, FACTORIES_NAMES} from "../dw_consts";
import {IUIMediator, UIMediator, UIMediatorMessageType} from "../mediator/IUIMediator";
import {BrowserConsoleInputView, CLIInputView, IInputView} from "../view/IInputView";
import {ExecuteCliCommand} from "../command/ExecuteCliCommand";
import {IsCliCommandGuards} from "../command/guards/IsCliCommandGuards";

export interface IAppContextImmutable extends IContextImmutable
{

}

export interface IAppContext extends IAppContextImmutable, IContext
{
    getInstance<T>(factory: IFactoryImmutable, type: Type<T>, immutableType: Type, name?: string): T;
}

export type AppContextConfig = ContextConfig & {
    readonly defaultCliUI?: boolean;
    readonly isFrontEndApp?: boolean;
};

export class AppContext extends AbstractContext implements IAppContext
{
    private static readonly ADD_ERROR: string = "Use 'add' method instead";
    private static readonly REMOVE_ERROR: string = "Use 'remove' method instead";

    @inject(DW_TYPES.AppContextConfig) @optional()
    private appContextConfig!:AppContextConfig;

    @inject(DW_TYPES.IFactory) @named(FACTORIES_NAMES.CONTEXT) @optional()
    protected contextFactory!: IFactory;

    @inject(DW_TYPES.IFactory) @named(FACTORIES_NAMES.MODEL) @optional()
    protected modelFactory!: IFactory;

    @inject(DW_TYPES.IFactory) @named(FACTORIES_NAMES.MEDIATOR) @optional()
    protected mediatorFactory!: IFactory;

    @inject(DW_TYPES.IFactory) @named(FACTORIES_NAMES.VIEW) @optional()
    protected viewFactory!: IFactory;

    protected override init()
    {
        super.init();

        if (!this.appContextConfig)
        {
            this.appContextConfig = {
                forwardMessageFromMediatorsToModels: this.config.forwardMessageFromMediatorsToModels,
                forwardMessageFromMediatorsToMediators: this.config.forwardMessageFromMediatorsToMediators,
                forwardMessageFromModelsToMediators: this.config.forwardMessageFromModelsToMediators,
                forwardMessageFromModelsToModels: this.config.forwardMessageFromModelsToModels,
                defaultCliUI: false
            };
        }

        if (!this.contextFactory)
        {
            this.createFactories();
        }

        this.mapTypes();
        this.mapValues();
        this.createMediators();
        this.mapCommands();
    }

    private createFactories()
    {
        this.contextFactory = new Factory(this.logger);
        this.modelFactory = new Factory(this.logger);
        this.mediatorFactory = new Factory(this.logger);
        this.viewFactory = new Factory(this.logger);
    }

    public override add(child: IHierarchyObject, index?: number): boolean
    {
        if (instanceOf(child, "IModelContainer") || instanceOf(child, "IMediatorContainer"))
        {
            return super.add(child, index);
        }

        let success = false;

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
        if (instanceOf(child, "IModelContainer") || instanceOf(child, "IMediatorContainer"))
        {
            return super.remove(child, dispose);
        }

        let success = false;

        if (instanceOf(child, "IModel"))
        {
            success = !this.modelContainer.contains(child);
            super.removeModel(child);
        }
        else if (instanceOf(child, "IMediator"))
        {
            success = !this.mediatorContainer.contains(child);
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

    private createMediators(): void
    {
        if (this.appContextConfig.defaultCliUI)
        {
            const uiMediator: IUIMediator = this.mediatorFactory.getInstance<IUIMediator>("IUIMediator");
            this.add(uiMediator);
        }
    }

    private mapTypes(): void
    {
        if (this.appContextConfig.defaultCliUI)
        {
            this.mediatorFactory.mapToType<IUIMediator>("IUIMediator", UIMediator);
            this.viewFactory.mapToType<IInputView>("IInputView",
                this.appContextConfig.isFrontEndApp ? BrowserConsoleInputView : CLIInputView);
        }
    }

    private mapCommands(): void
    {
        this.map(UIMediatorMessageType.INPUT, ExecuteCliCommand).addGuards(IsCliCommandGuards);
    }

    private mapValues(): void
    {
        this.contextFactory.mapToValue(DW_TYPES.IFactory, this.contextFactory, FACTORIES_NAMES.CONTEXT);
        this.contextFactory.mapToValue(DW_TYPES.IFactory, this.modelFactory, FACTORIES_NAMES.MODEL);
        this.contextFactory.mapToValue(DW_TYPES.IFactory, this.mediatorFactory, FACTORIES_NAMES.MEDIATOR);
        this.contextFactory.mapToValue(DW_TYPES.IFactory, this.viewFactory, FACTORIES_NAMES.VIEW);

        this.modelFactory.mapToValue(DW_TYPES.IFactoryImmutable, this.modelFactory, FACTORIES_NAMES.MODEL);

        this.mediatorFactory.mapToValue(DW_TYPES.IFactoryImmutable, this.viewFactory, FACTORIES_NAMES.VIEW);

        this.factory.mapToValue(DW_TYPES.ICommandMapper, this);
    }
}