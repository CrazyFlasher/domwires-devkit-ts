import "reflect-metadata";
import {AbstractModel, IFactoryImmutable} from "domwires";
import {IService, ServiceConfig, ServiceMessageType} from "./IService";
import {inject, optional, postConstruct} from "inversify";
import {DwError} from "../DwError";
import {DW_TYPES} from "../dw_consts";

export abstract class AbstractService extends AbstractModel implements IService
{
    @inject(DW_TYPES.ServiceConfig)
    protected config: ServiceConfig;

    @inject(DW_TYPES.IFactoryImmutable) @optional()
    protected factory: IFactoryImmutable;

    private _initialized = false;
    private _enabled: boolean;

    @postConstruct()
    private postConstruct(): void
    {
        this._enabled = this.config.enabled === undefined || this.config.enabled;
    }

    public init(): IService
    {
        if (this.preInitSuccess())
        {
            this.continueInit();
        }
        else
        {
            this.initFail();
        }

        return this;
    }

    protected continueInit(): void
    {
        // override and call 'initSuccess' when initialization is completed
        throw new Error(DwError.OVERRIDE.name);
    }

    protected preInitSuccess(): boolean
    {
        return this.checkEnabled() && !this._initialized;
    }

    protected initSuccess(): void
    {
        this.info("Init success!");

        this._initialized = true;

        this.dispatchMessage(ServiceMessageType.INIT_SUCCESS);
    }

    protected initFail(): void
    {
        this.warn("Init fail!");

        this.dispatchMessage(ServiceMessageType.INIT_FAIL);
    }

    protected checkEnabled(): boolean
    {
        if (!this.enabled)
        {
            this.warn("Service is disabled on config level!");
        }

        return this.enabled;
    }

    protected checkInitialized(): boolean
    {
        if (!this._initialized)
        {
            this.warn("Service is not initialized. Did you call 'init'?");
        }

        return this._initialized;
    }

    public get initialized(): boolean
    {
        return this._initialized;
    }

    public get enabled(): boolean
    {
        return this._enabled;
    }
}