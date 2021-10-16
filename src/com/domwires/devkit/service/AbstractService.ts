import "reflect-metadata";
import {AbstractModel, IAppFactory, logger} from "domwires";
import {IService, ServiceConfig, ServiceMessageType} from "./IService";
import {inject, optional} from "inversify";
import * as dk from "../types";
import {DwError} from "../DwError";

export abstract class AbstractService extends AbstractModel implements IService
{
    @inject(dk.TYPES.ServiceConfig)
    private _config: ServiceConfig;

    @inject(dk.TYPES.IAppFactory) @optional()
    private _factory: IAppFactory;

    private _initialized = false;

    public init(): IService
    {
        if (this.preInitSuccess())
        {
            this.continueInit();
        } else
        {
            this.initFail();
        }

        return this;
    }

    protected continueInit()
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
        logger.info("Init success!");

        this._initialized = true;

        this.dispatchMessage(ServiceMessageType.INIT_SUCCESS);
    }

    protected initFail(): void
    {
        logger.warn("Init fail!");

        this.dispatchMessage(ServiceMessageType.INIT_FAIL);
    }

    protected checkEnabled(): boolean
    {
        if (!this._config.enabled)
        {
            logger.warn("Service is disabled on config level!");
        }

        return this._config.enabled;
    }

    protected checkInitialized(): boolean
    {
        if (!this._initialized)
        {
            logger.warn("Service is not initialized. Did you call 'init'?");
        }

        return this._initialized;
    }

    public get initialized(): boolean
    {
        return this._initialized;
    }

    public get config(): ServiceConfig
    {
        return this._config;
    }
}