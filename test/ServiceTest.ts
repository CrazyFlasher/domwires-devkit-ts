import "reflect-metadata";
import {Suite} from "mocha";
import {expect} from "chai";
import {MockService1, MockService2, MockServiceConfig} from "./mock/MockServices";
import {Factory, IFactory, Logger} from "domwires";
import {MOCK_TYPES} from "./mock/mock_types";
import {DW_TYPES} from "../src/com/domwires/devkit/common/dw_consts";
import {ServiceConfig, ServiceMessageType} from "../src/com/domwires/devkit/common/service/IService";

describe('ServiceTest', function (this: Suite)
{
    let factory: IFactory;

    beforeEach(() =>
    {
        factory = new Factory(new Logger());
    });

    afterEach(() =>
    {
        factory.dispose();
    });

    it('testConstructThrowsBindingError', () =>
    {
        expect(() => factory.getInstance<MockService1>(MockService1)).to.throw("No matching bindings found");
    });

    it('testEnabledTrueByDefault', () =>
    {
        factory.mapToValue(DW_TYPES.ServiceConfig, {});

        const service: MockService1 = factory.getInstance<MockService1>(MockService1);

        expect(service.enabled).true;
    });

    it('testEnabledInitializedFalse', () =>
    {
        const config: ServiceConfig = {enabled: false};
        factory.mapToValue(DW_TYPES.ServiceConfig, config);

        const service: MockService1 = factory.getInstance<MockService1>(MockService1);

        expect(service.enabled).false;

        service.addMessageListener(ServiceMessageType.INIT_FAIL, () =>
        {
            expect(service.initialized).false;
        });
        service.init();
    });

    it('testEnabledInitializedTrue', () =>
    {
        const config: ServiceConfig = {enabled: true};
        factory.mapToValue(DW_TYPES.ServiceConfig, config);

        const service: MockService1 = factory.getInstance<MockService1>(MockService1);

        expect(service.enabled).true;

        service.addMessageListener(ServiceMessageType.INIT_SUCCESS, () =>
        {
            expect(service.initialized).true;
        });
        service.init();
    });

    it('testWithSpecificConfig', () =>
    {
        const config: MockServiceConfig = {enabled: true, id: "mockServ"};
        factory.mapToValue(DW_TYPES.ServiceConfig, config);
        factory.mapToValue(MOCK_TYPES.MockServiceConfig, config);

        const service: MockService2 = factory.getInstance<MockService2>(MockService2);

        expect(service.enabled).true;
        expect(service.mockServiceConfig.id).equals("mockServ");

        service.addMessageListener(ServiceMessageType.INIT_SUCCESS, () =>
        {
            expect(service.initialized).true;
        });
        service.init();
    });
});