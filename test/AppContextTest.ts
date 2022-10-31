import "reflect-metadata";
import {Suite} from "mocha";
import {expect} from "chai";
import {
    AbstractCommand,
    ContextConfig,
    Factory,
    IFactory,
    lazyInject,
    lazyInjectNamed,
    Logger,
    LogLevel
} from "domwires";
import {IMockModel} from "./mock/MockModels";
import {IChildMockContext, IMainMockContext} from "./mock/MockContexts";
import "./mock/MockModels";
import "./mock/MockContexts";
import {AppContext, AppContextConfigBuilder} from "../src/com/domwires/devkit/common/context/IAppContext";
import {UIMediatorMessageType} from "../src/com/domwires/devkit/common/mediator/IUIMediator";
import {injectable} from "inversify";
import {printMappedToAliasCommandsToConsole, registerCommandAlias} from "../src/com/domwires/devkit/common/Global";
import {Types} from "../src/com/domwires/devkit/common/Types";

const logger = new Logger(LogLevel.INFO);

@injectable()
export class TestObj
{
    private _d = 0;
    private _s!: string;
    private _n!: number;

    public get d(): number
    {
        return this._d;
    }

    public set d(value: number)
    {
        this._d = value;
    }

    public get n(): number
    {
        return this._n;
    }

    public set n(value: number)
    {
        this._n = value;
    }
    public get s(): string
    {
        return this._s;
    }

    public set s(value: string)
    {
        this._s = value;
    }
}

class TestCommand extends AbstractCommand
{
    @lazyInject(TestObj)
    private obj!: TestObj;

    public override execute(): void
    {
        this.obj.d += 7;
    }
}

class TestCommandWithParams extends AbstractCommand
{
    @lazyInject(TestObj)
    private obj!: TestObj;

    @lazyInjectNamed("string", "str")
    private str!: string;

    @lazyInjectNamed("number", "num")
    private num!: number;

    public override execute(): void
    {
        this.obj.d += 7;
        this.obj.s = this.str;
        this.obj.n = this.num;
    }
}

class TestCommandForChildContext extends AbstractCommand
{
    @lazyInject("IMockModel")
    private model!: IMockModel;

    public override execute(): void
    {
        this.model.v += 5;
    }
}

describe('AppContextTest', function (this: Suite)
{
    let mainContext: IMainMockContext;
    let mainContextFactory: IFactory;

    beforeEach(() =>
    {
        mainContextFactory = new Factory(logger);

        const cb:AppContextConfigBuilder = new AppContextConfigBuilder();
        cb.defaultCliUI = true;

        const config = cb.build();

        mainContextFactory.mapToValue<ContextConfig>(Types.ContextConfig, config);
        mainContextFactory.mapToValue(Types.IFactory, mainContextFactory);

        mainContext = mainContextFactory.getInstance("IMainMockContext");
    });

    afterEach(() =>
    {
        mainContext.dispose();
    });

    it('testCliCommand', () =>
    {
        registerCommandAlias(TestCommand, "test_cmd");

        const to: TestObj = mainContextFactory.getInstance<TestObj>(TestObj);
        mainContextFactory.mapToValue<TestObj>(TestObj, to);

        mainContext.getMediatorMutable()?.dispatchMessage(UIMediatorMessageType.INPUT, {value: "/cmd:main:test_cmd"});

        expect(to.d).equals(7);

        registerCommandAlias(TestCommandForChildContext, "test_cmd_for_child");

        const childContext: IChildMockContext = mainContext.getChildContext();
        const model: IMockModel = childContext.getMockModel();
        mainContext.addModel(childContext);
        childContext.addModel(model);

        childContext.getFactoryMutable().mapToValue<IMockModel>("IMockModel", model);

        mainContext.getMediatorMutable()?.dispatchMessage(UIMediatorMessageType.INPUT, {value: "/cmd:child:test_cmd_for_child"});

        expect(model.v).equals(5);
    });

    it('testCliCommandInUnnamedContext', () =>
    {
        registerCommandAlias(TestCommand, "test_cmd");

        const f = new Factory(new Logger(LogLevel.INFO));
        const to: TestObj = mainContextFactory.getInstance<TestObj>(TestObj);
        f.mapToValue<TestObj>(TestObj, to);
        f.mapToValue(Types.IFactory, f);

        const c = f.getInstance<AppContext>(AppContext);

        c.dispatchMessage(UIMediatorMessageType.INPUT, {value: "/cmd:test_cmd"});

        expect(to.d).equals(7);
    });

    it('testCliCommandWithParams', () =>
    {
        registerCommandAlias(TestCommandWithParams, "test_cmd");

        const f = new Factory(new Logger(LogLevel.INFO));
        const to: TestObj = mainContextFactory.getInstance<TestObj>(TestObj);
        f.mapToValue<TestObj>(TestObj, to);
        f.mapToValue(Types.IFactory, f);

        const c = f.getInstance<AppContext>(AppContext);

        c.dispatchMessage(UIMediatorMessageType.INPUT, {value: "/cmd:test_cmd:{\"str\":\"test\", \"num\":5}"});

        expect(to.d).equals(7);
        expect(to.s).equals("test");
        expect(to.n).equals(5);
    });

    it('testCreateMainContextWithChildContext', () =>
    {
        const childContext: IChildMockContext = mainContext.getChildContext();
        const model: IMockModel = childContext.getMockModel();

        // instantiated
        expect(mainContext.getContextFactory()).exist;
        expect(mainContext.getModelFactory()).exist;
        expect(mainContext.getMediatorFactory()).exist;
        expect(mainContext.getViewFactory()).exist;

        // injected from main context
        expect(childContext.getContextFactory());
        expect(childContext.getModelFactory());
        expect(childContext.getMediatorFactory());
        expect(childContext.getViewFactory());

        expect(model.getContextFactory()).not.exist;
        expect(model.getModelFactory()).exist;
        expect(model.getMediatorFactory()).not.exist;
        expect(model.getViewFactory()).not.exist;

        expect(mainContext.getFactory()).not.equals(childContext.getFactory());
        expect(mainContext.getContextFactory()).equals(childContext.getContextFactory());
        expect(mainContext.getModelFactory()).equals(childContext.getModelFactory());
        expect(mainContext.getMediatorFactory()).equals(childContext.getMediatorFactory());
        expect(mainContext.getViewFactory()).equals(childContext.getViewFactory());
        expect(mainContext.getModelFactory()).equals(model.getModelFactory());
        expect(childContext.getMockModel()).not.equals(childContext.getMockModel2());

        expect(childContext.parent).not.equals(mainContext);
        expect(model.parent).not.equals(childContext);

        mainContext.addModel(childContext);
        childContext.addModel(model);

        expect(childContext.parent).equals(mainContext);
        expect(model.parent).equals(childContext);

        mainContext.remove(childContext);
        childContext.remove(model);

        expect(childContext.parent).not.equals(mainContext);
        expect(model.parent).not.equals(childContext);
    });

    it('testPrintCommands', () =>
    {
        registerCommandAlias(TestCommand, "test_cmd", "very cool and useful command");
        registerCommandAlias(TestCommandForChildContext, "test_cmd_child");
        registerCommandAlias(TestCommandWithParams, "test_cmd_params", "command that accept params", [
            {type: Types.string, name: "str"},
            {type: Types.number, name: "num"}
        ]);

        printMappedToAliasCommandsToConsole();
    });
});