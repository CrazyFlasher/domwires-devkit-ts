import "reflect-metadata";
import {Suite} from "mocha";
import {expect} from "chai";
import {
    AbstractCommand,
    ContextConfig,
    definableFromString,
    Factory,
    IFactory,
    lazyInject,
    Logger,
    LogLevel
} from "domwires";
import {IMockModel} from "./mock/MockModels";
import {IChildMockContext, IMainMockContext} from "./mock/MockContexts";
import "./mock/MockModels";
import "./mock/MockContexts";
import {AppContext, AppContextConfig} from "../src/com/domwires/devkit/common/context/IAppContext";
import {UIMediatorMessageType} from "../src/com/domwires/devkit/common/mediator/IUIMediator";
import {injectable} from "inversify";
import {DW_TYPES} from "../src/com/domwires/devkit/common/dw_consts";

@injectable()
export class TestObj
{
    private _d = 0;

    public get d(): number
    {
        return this._d;
    }

    public set d(value: number)
    {
        this._d = value;
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
        mainContextFactory = new Factory(new Logger(LogLevel.INFO));
        const config: AppContextConfig = {
            forwardMessageFromMediatorsToModels: false,
            forwardMessageFromMediatorsToMediators: true,
            forwardMessageFromModelsToMediators: true,
            forwardMessageFromModelsToModels: false,
            forwardMessageFromMediatorsToContexts: true,
            forwardMessageFromModelsToContexts: true,
            defaultCliUI: true
        };
        mainContextFactory.mapToValue<ContextConfig>("ContextConfig", config);
        mainContextFactory.mapToValue<AppContextConfig>("AppContextConfig", config);
        mainContextFactory.mapToValue(DW_TYPES.IFactory, mainContextFactory);

        mainContext = mainContextFactory.getInstance("IMainMockContext");
    });

    afterEach(() =>
    {
        mainContext.dispose();
    });

    it('testCliCommand', () =>
    {
        definableFromString<TestCommand>(TestCommand, "test_cmd");

        const to: TestObj = mainContextFactory.getInstance<TestObj>(TestObj);
        mainContextFactory.mapToValue<TestObj>(TestObj, to);

        mainContext.getMediatorMutable().dispatchMessage(UIMediatorMessageType.INPUT, {value: "/cmd:main:test_cmd"});

        expect(to.d).equals(7);

        definableFromString<TestCommandForChildContext>(TestCommandForChildContext, "test_cmd_for_child");

        const childContext: IChildMockContext = mainContext.getChildContext();
        const model: IMockModel = childContext.getModel();
        mainContext.add(childContext);
        childContext.add(model);

        childContext.getFactoryMutable().mapToValue<IMockModel>("IMockModel", model);

        mainContext.getMediatorMutable().dispatchMessage(UIMediatorMessageType.INPUT, {value: "/cmd:child:test_cmd_for_child"});

        expect(model.v).equals(5);
    });

    it('testCliCommandInUnnamedContext', () =>
    {
        definableFromString<TestCommand>(TestCommand, "test_cmd");

        const f = new Factory(new Logger(LogLevel.INFO));
        const to: TestObj = mainContextFactory.getInstance<TestObj>(TestObj);
        f.mapToValue<TestObj>(TestObj, to);
        f.mapToValue(DW_TYPES.IFactory, f);

        const c = f.getInstance<AppContext>(AppContext);

        c.dispatchMessage(UIMediatorMessageType.INPUT, {value: "/cmd:test_cmd"});

        expect(to.d).equals(7);
    });

    it('testCreateMainContextWithChildContext', () =>
    {
        const childContext: IChildMockContext = mainContext.getChildContext();
        const model: IMockModel = childContext.getModel();

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
        expect(childContext.getModel()).equals(childContext.getModel2());

        expect(childContext.parent).not.equals(mainContext);
        expect(model.parent).not.equals(childContext);

        mainContext.add(childContext);
        childContext.add(model);

        expect(childContext.parent).equals(mainContext);
        expect(model.parent).equals(childContext);

        mainContext.remove(childContext);
        childContext.remove(model);

        expect(childContext.parent).not.equals(mainContext);
        expect(model.parent).not.equals(childContext);
    });
});