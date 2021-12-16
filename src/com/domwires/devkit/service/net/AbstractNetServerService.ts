import {DwError} from "../../DwError";
import {AbstractService} from "../AbstractService";
import {
    INetServerService,
    NetServerServiceConfig,
    NetServerServiceMessageType,
    RequestResponse
} from "./INetServerService";
import {logger} from "domwires";
import {inject} from "inversify";
import {DW_TYPES} from "../../dw_consts";

export abstract class AbstractNetServerService<ReqResType> extends AbstractService implements INetServerService<ReqResType>
{
    @inject(DW_TYPES.NetServerServiceConfig)
    protected netServerServiceConfig: NetServerServiceConfig;

    protected _requestData: RequestResponse<ReqResType>;
    protected _isOpened = false;

    protected reqMap: Map<string, RequestResponse<ReqResType>> = new Map<string, RequestResponse<ReqResType>>();

    public override dispose(): void
    {
        this.close();

        super.dispose();
    }

    protected override continueInit()
    {
        this.createServer();
    }

    public close(): INetServerService<ReqResType>
    {
        throw new Error(DwError.OVERRIDE.name);
    }

    protected openSuccess(): void
    {
        logger.info("Server started: " + this.serverName);

        this._isOpened = true;

        this.dispatchMessage(NetServerServiceMessageType.OPEN_SUCCESS);
    }

    protected openFail(err: Error): void
    {
        logger.warn("Failed to start server: " + this.serverName);
        logger.warn(err);

        this.dispatchMessage(NetServerServiceMessageType.OPEN_FAIL);
    }

    protected closeSuccess(): void
    {
        logger.info("Server closed: " + this.serverName);

        this._isOpened = false;

        this.dispatchMessage(NetServerServiceMessageType.CLOSE_SUCCESS);
    }

    protected closeFail(err: Error): void
    {
        logger.warn("Failed to close server: " + this.serverName);
        logger.error(err);

        this.dispatchMessage(NetServerServiceMessageType.CLOSE_FAIL);
    }

    protected get serverName(): string
    {
        return this.netServerServiceConfig.host + ":" + this.netServerServiceConfig.port;
    }

    protected createServer(): void
    {
        throw new Error(DwError.OVERRIDE.name);
    }

    public startListen(request: RequestResponse<ReqResType>): INetServerService<ReqResType>
    {
        if (!this.checkIsOpened())
        {
            return this;
        }

        if (!this.isListening(request))
        {
            this.reqMap.set(request.id, request);
        }

        return this;
    }

    public isListening(request: RequestResponse<ReqResType>): boolean
    {
        return this.reqMap.has(request.id);
    }

    public stopListen(request: RequestResponse<ReqResType>): INetServerService<ReqResType>
    {
        if (!this.checkIsOpened())
        {
            return this;
        }

        if (this.isListening(request))
        {
            this.reqMap.delete(request.id);
        }

        return this;
    }

    public get requestData(): RequestResponse<ReqResType>
    {
        return this._requestData;
    }

    public get isOpened(): boolean
    {
        return this._isOpened;
    }

    protected checkIsOpened(): boolean
    {
        if (!this.checkEnabled() || !this.checkInitialized()) return false;

        if (!this._isOpened)
        {
            logger.warn("Server is not opened!");

            return false;
        }

        return true;
    }
}