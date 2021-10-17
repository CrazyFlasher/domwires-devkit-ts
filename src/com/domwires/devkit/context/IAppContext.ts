/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
    AbstractContext,
    AppFactory,
    IAppFactory,
    IAppFactoryImmutable,
    IContext,
    IContextImmutable,
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

export interface IAppContextImmutable extends IContextImmutable
{

}

export interface IAppContext extends IAppContextImmutable, IContext
{
    getInstance<T>(factory: IAppFactoryImmutable, type: Type<T>, immutableType: Type, name?: string): T;
}

export class AppContext extends AbstractContext implements IAppContext
{
    private static readonly ADD_ERROR: string = "Use 'add' method instead";
    private static readonly REMOVE_ERROR: string = "Use 'remove' method instead";

    @inject(DW_TYPES.IAppFactory) @named(FACTORIES_NAMES.CONTEXT) @optional()
    protected contextFactory: IAppFactory;

    @inject(DW_TYPES.IAppFactory) @named(FACTORIES_NAMES.MODEL) @optional()
    protected modelFactory: IAppFactory;

    @inject(DW_TYPES.IAppFactory) @named(FACTORIES_NAMES.MEDIATOR) @optional()
    protected mediatorFactory: IAppFactory;

    @inject(DW_TYPES.IAppFactory) @named(FACTORIES_NAMES.VIEW) @optional()
    protected viewFactory: IAppFactory;

    protected override init()
    {
        super.init();

        if (!this.contextFactory)
        {
            this.createFactories();
        }
    }

    protected createFactories()
    {
        this.contextFactory = new AppFactory();
        this.modelFactory = new AppFactory();
        this.mediatorFactory = new AppFactory();
        this.viewFactory = new AppFactory();

        this.contextFactory.mapToValue(DW_TYPES.IAppFactory, this.contextFactory, FACTORIES_NAMES.CONTEXT);
        this.contextFactory.mapToValue(DW_TYPES.IAppFactory, this.modelFactory, FACTORIES_NAMES.MODEL);
        this.contextFactory.mapToValue(DW_TYPES.IAppFactory, this.mediatorFactory, FACTORIES_NAMES.MEDIATOR);
        this.contextFactory.mapToValue(DW_TYPES.IAppFactory, this.viewFactory, FACTORIES_NAMES.VIEW);

        this.modelFactory.mapToValue(DW_TYPES.IAppFactoryImmutable, this.modelFactory, FACTORIES_NAMES.MODEL);

        this.mediatorFactory.mapToValue(DW_TYPES.IAppFactoryImmutable, this.viewFactory, FACTORIES_NAMES.VIEW);
    }

    public add(child: IHierarchyObject, index?: number): boolean
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

    public remove(child: IHierarchyObject, dispose?: boolean): boolean
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

    public addModel(model: IModel): IModelContainer
    {
        throw new Error(AppContext.ADD_ERROR);
    }

    public addMediator(mediator: IMediator): IMediatorContainer
    {
        throw new Error(AppContext.ADD_ERROR);
    }

    public removeModel(model: IModel, dispose?: boolean): IModelContainer
    {
        throw new Error(AppContext.REMOVE_ERROR);
    }

    public removeMediator(mediator: IMediator, dispose?: boolean): IMediatorContainer
    {
        throw new Error(AppContext.REMOVE_ERROR);
    }

    public getInstance<T>(factory: IAppFactoryImmutable, type: Type<T>, immutableType: Type, name?: string): T
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

}