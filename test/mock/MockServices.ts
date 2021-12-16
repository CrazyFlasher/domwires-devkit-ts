import {AbstractService} from "../../src/com/domwires/devkit/service/AbstractService";
import {ServiceConfig} from "../../src/com/domwires/devkit/service/IService";
import {inject} from "inversify";
import {MOCK_TYPES} from "./mock_types";

export type MockServiceConfig = ServiceConfig & {
    readonly id: string;
};

export class MockService1 extends AbstractService
{
    protected override continueInit()
    {
        this.initSuccess();
    }
}

export class MockService2 extends AbstractService
{
    @inject(MOCK_TYPES.MockServiceConfig)
    private _mockServiceConfig: MockServiceConfig;

    protected override continueInit()
    {
        this.initSuccess();
    }

    public get mockServiceConfig(): MockServiceConfig
    {
        return this._mockServiceConfig;
    }
}