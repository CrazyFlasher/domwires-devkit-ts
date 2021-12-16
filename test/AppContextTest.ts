import "reflect-metadata";
import {Suite} from "mocha";
import {expect} from "chai";
import {Factory} from "domwires";
import {IMockModel} from "./mock/MockModels";
import {IChildMockContext, IMainMockContext} from "./mock/MockContexts";
import "./mock/MockModels";
import "./mock/MockContexts";

describe('AppContextTest', function (this: Suite)
{
    it('testCreateMainContextWithChildContext', () =>
    {
        const mainContext: IMainMockContext = new Factory().getInstance("IMainMockContext");
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