import {AppContext, IAppContext} from "../../src/com/domwires/devkit/common/app/context/IAppContext";
import {Class, IFactory, IFactoryImmutable, IHierarchyObject, setDefaultImplementation} from "domwires";
import {IMockModel} from "./MockModels";
import {
    IServerMainContext,
    IServerMainContextImmutable
} from "../../src/com/domwires/devkit/server/main/context/IServerMainContext";
import {IInputView} from "../../src/com/domwires/devkit/common/app/view/IInputView";
import {CliInputView} from "../../src/com/domwires/devkit/server/main/view/CliInputView";
import {DwError} from "../../src/com/domwires/devkit/common/DwError";
import {IServerAuthContext} from "../../src/com/domwires/devkit/server/auth/context/IServerAuthContext";
import {IHttpServerService} from "../../src/com/domwires/devkit/server/common/service/net/http/IHttpServerService";
import {
    ISocketServerService
} from "../../src/com/domwires/devkit/server/common/service/net/socket/ISocketServerService";
import {IAuthDataBaseService} from "../../src/com/domwires/devkit/server/common/service/net/db/IAuthDataBaseService";
import {IEmailService} from "../../src/com/domwires/devkit/server/common/service/net/email/IEmailService";

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

    getMediatorMutable(): IHierarchyObject;
}

export interface IBaseMockContextImmutable extends IServerMainContextImmutable
{
    getModelFactory(): IFactoryImmutable;

    getContextFactory(): IFactoryImmutable;

    getMediatorFactory(): IFactoryImmutable;

    getViewFactory(): IFactoryImmutable;

    getFactory(): IFactoryImmutable;
}

export class BaseMockContext extends AppContext implements IServerMainContext
{
    private factories!: {
        contextFactory: IFactory; modelFactory: IFactory; serviceFactory: IFactory;
        mediatorFactory: IFactory; viewFactory: IFactory;
    };

    public initializationComplete(): IServerMainContext
    {
        throw new Error(DwError.NOT_IMPLEMENTED.name);
    }

    public shutDownComplete(): IServerMainContext
    {
        throw new Error(DwError.NOT_IMPLEMENTED.name);
    }

    public createChildContexts(): IServerMainContext
    {
        throw new Error(DwError.NOT_IMPLEMENTED.name);
    }

    public get authContext(): IServerAuthContext
    {
        throw new Error(DwError.NOT_IMPLEMENTED.name);
    }

    public get db(): IAuthDataBaseService
    {
        throw new Error(DwError.NOT_IMPLEMENTED.name);
    }

    public get email(): IEmailService
    {
       throw new Error(DwError.NOT_IMPLEMENTED.name);
    }

    public get http(): IHttpServerService
    {
        throw new Error(DwError.NOT_IMPLEMENTED.name);
    }

    public get socket(): ISocketServerService
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

    public getMediatorMutable(): IHierarchyObject
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
        this.setId("child");

        super.init();

        this.model = this.getModelInstance("IMockModel", "IMockModelImmutable");
        this.model2 = this.getModelInstance("IMockModel", "IMockModelImmutable");
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
        this.setId("main");

        super.init();

        this.childContext = this.getContextInstance("IChildMockContext", "IChildMockContextImmutable");
    }

    public getChildContext(): IChildMockContext
    {
        return this.childContext;
    }
}

setDefaultImplementation<IMainMockContext>("IMainMockContext", MainMockContext);
setDefaultImplementation<IChildMockContext>("IChildMockContext", ChildMockContext);