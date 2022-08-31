import "reflect-metadata";
import {Suite} from "mocha";
import {expect} from "chai";
import {AbstractCommand, definableFromString, Factory, IFactory, lazyInject, Logger} from "domwires";
import {IMockModel} from "./mock/MockModels";
import {IChildMockContext, IMainMockContext} from "./mock/MockContexts";
import "./mock/MockModels";
import "./mock/MockContexts";
import {AppContextConfig} from "../src/com/domwires/devkit/common/context/IAppContext";
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

describe('AppContextTest', function (this: Suite)
{
    let mainContext: IMainMockContext;
    let mainContextFactory: IFactory;

    beforeEach(() =>
    {
        mainContextFactory = new Factory(new Logger());
        mainContextFactory.mapToValue<AppContextConfig>("AppContextConfig", {
            forwardMessageFromMediatorsToModels: false,
            forwardMessageFromMediatorsToMediators: true,
            forwardMessageFromModelsToMediators: true,
            forwardMessageFromModelsToModels: false,
            defaultCliUI: true
        });
        mainContextFactory.mapToValue(DW_TYPES.IFactory, mainContextFactory);

        mainContext = mainContextFactory.getInstance("IMainMockContext");
    });

    it('testCliCommand', () =>
    {
        definableFromString<TestCommand>(TestCommand, "test_cmd");

        const to: TestObj = mainContextFactory.getInstance<TestObj>(TestObj);
        mainContextFactory.mapToValue<TestObj>(TestObj, to);

        mainContext.dispatchMessage(UIMediatorMessageType.INPUT, {value: "/cmd:test_cmd"});

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