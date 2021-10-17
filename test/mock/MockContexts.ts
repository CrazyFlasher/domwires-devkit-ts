/* eslint-disable @typescript-eslint/no-empty-interface */

import {AppContext, IAppContext, IAppContextImmutable} from "../../src/com/domwires/devkit/context/IAppContext";
import {IAppFactoryImmutable} from "../../../domwires-ts";
import {setDefaultImplementation} from "domwires";
import {IMockModel} from "./MockModels";

export interface IMainMockContext extends IMainMockContextImmutable, IBaseMockContext
{
    getChildContext(): IChildMockContext;
}

export interface IMainMockContextImmutable extends IBaseMockContextImmutable
{
}

export interface IChildMockContext extends IChildMockContextImmutable, IBaseMockContext
{
    getModel(): IMockModel;

    getModel2(): IMockModel;
}

export interface IChildMockContextImmutable extends IBaseMockContextImmutable
{
}

export interface IBaseMockContext extends IBaseMockContextImmutable, IAppContext
{
}

export interface IBaseMockContextImmutable extends IAppContextImmutable
{
    getModelFactory(): IAppFactoryImmutable;

    getContextFactory(): IAppFactoryImmutable;

    getMediatorFactory(): IAppFactoryImmutable;

    getViewFactory(): IAppFactoryImmutable;

    getFactory(): IAppFactoryImmutable;
}

export class BaseMockContext extends AppContext implements IBaseMockContext
{
    public getModelFactory(): IAppFactoryImmutable
    {
        return this.modelFactory;
    }

    public getContextFactory(): IAppFactoryImmutable
    {
        return this.contextFactory;
    }

    public getMediatorFactory(): IAppFactoryImmutable
    {
        return this.mediatorFactory;
    }

    public getViewFactory(): IAppFactoryImmutable
    {
        return this.viewFactory;
    }

    public getFactory(): IAppFactoryImmutable
    {
        return this.factory;
    }
}

export class ChildMockContext extends BaseMockContext implements IChildMockContext
{
    private model: IMockModel;
    private model2: IMockModel;

    protected override init(): void
    {
        super.init();

        this.model = this.getInstance(this.modelFactory, "IMockModel", "IMockModelImmutable");
        this.model2 = this.getInstance(this.contextFactory, "IMockModel", "IMockModelImmutable");
    }

    public getModel(): IMockModel
    {
        return this.model;
    }

    public getModel2(): IMockModel
    {
        return this.model2;
    }
}

export class MainMockContext extends BaseMockContext implements IMainMockContext
{
    private childContext: IChildMockContext;

    protected override init(): void
    {
        super.init();

        this.childContext = this.getInstance(this.contextFactory, "IChildMockContext", "IChildMockContextImmutable");
    }

    public getChildContext(): IChildMockContext
    {
        return this.childContext;
    }
}

setDefaultImplementation("IMainMockContext", MainMockContext);
setDefaultImplementation("IChildMockContext", ChildMockContext);