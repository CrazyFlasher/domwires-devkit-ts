import "reflect-metadata";
import {Suite} from "mocha";
import {expect} from "chai";
import {MockService1, MockService2, MockServiceConfig} from "./mock/MockServices";
import {Factory, IFactory, Logger} from "domwires";
import {ServiceConfig, ServiceMessageType} from "../src/com/domwires/devkit/service/IService";
import {DW_TYPES} from "../src/com/domwires/devkit/dw_consts";
import {MOCK_TYPES} from "./mock/mock_types";

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
        expect(() => factory.getInstance(MockService1)).to.throw("No matching bindings found");
    });

    it('testEnabledTrueByDefault', () =>
    {
        factory.mapToValue(DW_TYPES.ServiceConfig, {});

        const service: MockService1 = factory.getInstance(MockService1);

        expect(service.enabled).true;
    });

    it('testEnabledInitializedFalse', () =>
    {
        const config: ServiceConfig = {enabled: false};
        factory.mapToValue(DW_TYPES.ServiceConfig, config);

        const service: MockService1 = factory.getInstance(MockService1);

        expect(service.enabled).false;

        let initComplete: boolean;

        service.addMessageListener(ServiceMessageType.INIT_FAIL, () => initComplete = true);
        service.init();

        expect(initComplete).true;
        expect(service.initialized).false;
    });

    it('testEnabledInitializedTrue', () =>
    {
        const config: ServiceConfig = {enabled: true};
        factory.mapToValue(DW_TYPES.ServiceConfig, config);

        const service: MockService1 = factory.getInstance(MockService1);

        expect(service.enabled).true;

        let initComplete: boolean;

        service.addMessageListener(ServiceMessageType.INIT_SUCCESS, () => initComplete = true);
        service.init();

        expect(initComplete).true;
        expect(service.initialized).true;
    });

    it('testWithSpecificConfig', () =>
    {
        const config: MockServiceConfig = {enabled: true, id: "mockServ"};
        factory.mapToValue(DW_TYPES.ServiceConfig, config);
        factory.mapToValue(MOCK_TYPES.MockServiceConfig, config);

        const service: MockService2 = factory.getInstance(MockService2);

        expect(service.enabled).true;
        expect(service.mockServiceConfig.id).equals("mockServ");

        let initComplete: boolean;

        service.addMessageListener(ServiceMessageType.INIT_SUCCESS, () => initComplete = true);
        service.init();

        expect(initComplete).true;
        expect(service.initialized).true;
    });
});