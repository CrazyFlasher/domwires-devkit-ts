import {Suite} from "mocha";
import {expect} from "chai";
import {MockService1, MockService2, MockServiceConfig} from "./mock/MockServices";
import {AppFactory, IAppFactory} from "domwires";
import * as m from "./mock/mock_types";
import * as dk from "../src/com/domwires/devkit/types";
import {ServiceConfig, ServiceMessageType} from "../src/com/domwires/devkit/service/IService";

describe('ServiceTest', function (this: Suite)
{
    let factory: IAppFactory;

    beforeEach(() =>
    {
        factory = new AppFactory();
    });

    afterEach(() =>
    {
        factory.dispose();
    });

    it('testConstructThrowsBindingError', () =>
    {
        expect(() => factory.getInstance(MockService1)).to.throw("No matching bindings found");
    });

    it('testEnabledInitializedFalse', () =>
    {
        const config: ServiceConfig = {enabled: false};
        factory.mapToValue(dk.TYPES.ServiceConfig, config);

        const service: MockService1 = factory.getInstance(MockService1);

        expect(service.config.enabled).false;

        let initComplete: boolean;

        service.addMessageListener(ServiceMessageType.INIT_FAIL, () => initComplete = true);
        service.init();

        expect(initComplete).true;
        expect(service.initialized).false;
    });

    it('testEnabledInitializedTrue', () =>
    {
        const config: ServiceConfig = {enabled: true};
        factory.mapToValue(dk.TYPES.ServiceConfig, config);

        const service: MockService1 = factory.getInstance(MockService1);

        expect(service.config.enabled).true;

        let initComplete: boolean;

        service.addMessageListener(ServiceMessageType.INIT_SUCCESS, () => initComplete = true);
        service.init();

        expect(initComplete).true;
        expect(service.initialized).true;
    });

    it('testWithSpecificConfig', () =>
    {
        const config: MockServiceConfig = {enabled: true, id: "mockServ"};
        factory.mapToValue(dk.TYPES.ServiceConfig, config);
        factory.mapToValue(m.TYPES.MockServiceConfig, config);

        const service: MockService2 = factory.getInstance(MockService2);

        expect(service.config.enabled).true;
        expect(service.mockServiceConfig.id).equals("mockServ");

        let initComplete: boolean;

        service.addMessageListener(ServiceMessageType.INIT_SUCCESS, () => initComplete = true);
        service.init();

        expect(initComplete).true;
        expect(service.initialized).true;
    });
});