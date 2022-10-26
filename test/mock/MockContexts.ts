/* eslint-disable @typescript-eslint/no-empty-interface */

import {AppContext, IAppContext} from "../../src/com/domwires/devkit/common/context/IAppContext";
import {Class, IFactory, IFactoryImmutable, IMediator, setDefaultImplementation} from "domwires";
import {IMockModel} from "./MockModels";
import {
    IServerAppContext,
    IServerAppContextImmutable
} from "../../src/com/domwires/devkit/server/main/context/IServerAppContext";
import {IInputView} from "../../src/com/domwires/devkit/common/view/IInputView";
import {CliInputView} from "../../src/com/domwires/devkit/server/main/view/CliInputView";
import {DwError} from "../../src/com/domwires/devkit/common/DwError";

export interface IMainMockContext extends IMainMockContextImmutable, IBaseMockContext
{
    getChildContext(): IChildMockContext;
}

export interface IMainMockContextImmutable extends IBaseMockContextImmutable
{
}

export interface IChildMockContext extends IChildMockContextImmutable, IBaseMockContext
{
    getMockModel(): IMockModel;

    getMockModel2(): IMockModel;
}

export interface IChildMockContextImmutable extends IBaseMockContextImmutable
{
}

export interface IBaseMockContext extends IBaseMockContextImmutable, IAppContext
{
    getFactoryMutable(): IFactory;

    getMediatorMutable(): IMediator;
}

export interface IBaseMockContextImmutable extends IServerAppContextImmutable
{
    getModelFactory(): IFactoryImmutable;

    getContextFactory(): IFactoryImmutable;

    getMediatorFactory(): IFactoryImmutable;

    getViewFactory(): IFactoryImmutable;

    getFactory(): IFactoryImmutable;
}

export class BaseMockContext extends AppContext implements IServerAppContext
{
    private factories!: {
        contextFactory: IFactory; modelFactory: IFactory; serviceFactory: IFactory;
        mediatorFactory: IFactory; viewFactory: IFactory;
    };

    public createChildContexts(): IServerAppContext
    {
        throw new Error(DwError.NOT_IMPLEMENTED.name);
    }

    protected override createFactories(): { contextFactory: IFactory; modelFactory: IFactory; serviceFactory: IFactory;
        mediatorFactory: IFactory; viewFactory: IFactory; }
    {
        this.factories = super.createFactories();

        return this.factories;
    }

    protected override get defaultUIViewClass(): Class<IInputView>
    {
        return CliInputView;
    }

    public getModelFactory(): IFactoryImmutable
    {
        return this.factories.modelFactory;
    }

    public getContextFactory(): IFactoryImmutable
    {
        return this.factories.contextFactory;
    }

    public getMediatorFactory(): IFactoryImmutable
    {
        return this.factories.mediatorFactory;
    }

    public getViewFactory(): IFactoryImmutable
    {
        return this.factories.viewFactory;
    }

    public getFactory(): IFactoryImmutable
    {
        return this.factory;
    }

    public getFactoryMutable(): IFactory
    {
        return this.factory;
    }

    public getMediatorMutable(): IMediator
    {
        return this.defaultUiMediator;
    }
}

export class ChildMockContext extends BaseMockContext implements IChildMockContext
{
    private model!: IMockModel;
    private model2!: IMockModel;

    protected override init(): void
    {
        this._id = "child";

        super.init();

        this.model = this.getModel("IMockModel", "IMockModelImmutable");
        this.model2 = this.getModel("IMockModel", "IMockModelImmutable");
    }

    public getMockModel(): IMockModel
    {
        return this.model;
    }

    public getMockModel2(): IMockModel
    {
        return this.model2;
    }
}

export class MainMockContext extends BaseMockContext implements IMainMockContext
{
    private childContext!: IChildMockContext;

    protected override init(): void
    {
        this._id = "main";

        super.init();

        this.childContext = this.getContext("IChildMockContext", "IChildMockContextImmutable");
    }

    public getChildContext(): IChildMockContext
    {
        return this.childContext;
    }
}

setDefaultImplementation<IMainMockContext>("IMainMockContext", MainMockContext);
setDefaultImplementation<IChildMockContext>("IChildMockContext", ChildMockContext);