import {
    INetServerService,
    NetServerServiceConfig,
    NetServerServiceMessageType,
    RequestData,
} from "./INetServerService";
import {inject} from "inversify";
import {AbstractService} from "../../../../common/service/AbstractService";
import {DwError} from "../../../../common/DwError";
import {Enum} from "domwires";
import {Types} from "../../../../common/Types";
import {serviceIdentifier} from "domwires/dist/com/domwires/core/Decorators";

@serviceIdentifier(Types.INetServerService)
export abstract class AbstractNetServerService extends AbstractService implements INetServerService
{
    @inject(Types.ServiceConfig)
    protected netServerServiceConfig!: NetServerServiceConfig;

    private _host!: string;
    private _port!: number;

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    protected _requestData!: RequestData<any>;
    protected _isOpened = false;

    private actionMap: Map<string, Enum> = new Map<string, Enum>();

    protected override postConstruct(): void
    {
        super.postConstruct();

        this._host = this.netServerServiceConfig.host;
        this._port = this.netServerServiceConfig.port;
    }

    public override dispose(): void
    {
        this.close();

        super.dispose();
    }

    protected override continueInit()
    {
        this.createServer();
    }

    public close(): INetServerService
    {
        throw new Error(DwError.OVERRIDE.name);
    }

    protected openSuccess(): void
    {
        this.info("Server started: " + this.serverName);

        this._isOpened = true;

        this.dispatchMessage(NetServerServiceMessageType.OPEN_SUCCESS);
    }

    protected openFail(err: Error | unknown): void
    {
        this.warn("Failed to start server: " + this.serverName);
        this.warn(err);

        this.dispatchMessage(NetServerServiceMessageType.OPEN_FAIL);
    }

    protected closeSuccess(): void
    {
        this.info("Server closed: " + this.serverName);

        this._isOpened = false;

        this.dispatchMessage(NetServerServiceMessageType.CLOSE_SUCCESS);
    }

    protected closeFail(err: Error): void
    {
        this.warn("Failed to close server: " + this.serverName);
        this.error(err);

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

    public startListen(actionList: Enum[]): INetServerService
    {
        if (!this.checkIsOpened())
        {
            return this;
        }

        actionList.map(action =>
        {
            if (!this.isListening(action))
            {
                this.startListenSingle(action);
            }
        });

        return this;
    }

    protected startListenSingle(action: Enum): void
    {
        this.actionMap.set(action.name, action);
    }

    public isListening(action: Enum): boolean;
    public isListening(actionName: string): boolean;
    public isListening(action: Enum | string): boolean
    {
        if (action instanceof Enum)
        {
            return this.actionMap.has(action.name);
        }

        return this.actionMap.has(action);
    }

    public stopListen(actionList: Enum[]): INetServerService
    {
        if (!this.checkIsOpened())
        {
            return this;
        }

        actionList.map(action =>
        {
            if (this.isListening(action))
            {
                this.stopListenSingle(action);
            }
        });

        return this;
    }

    protected stopListenSingle(action: Enum): void
    {
        this.actionMap.delete(action.name);
    }

    public getRequestData<TData>(): RequestData<TData>
    {
        return this._requestData;
    }

    public get isOpened(): boolean
    {
        return this._isOpened;
    }

    public get port(): number
    {
        return this._port;
    }

    public get host(): string
    {
        return this._host;
    }

    protected checkIsOpened(): boolean
    {
        if (!this.checkEnabled() || !this.checkInitialized()) return false;

        if (!this._isOpened)
        {
            this.warn("Server is not opened!");

            return false;
        }

        return true;
    }
}