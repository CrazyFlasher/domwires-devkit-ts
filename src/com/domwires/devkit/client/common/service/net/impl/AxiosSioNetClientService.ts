import {AbstractNetClientService} from "../AbstractNetClientService";
import {ClientServiceRequestType, INetClientService, NetClientServiceMessageType} from "../INetClientService";
import axios, {AxiosInstance} from "axios";
import {io, Socket} from "socket.io-client";

export class AxiosSioNetClientService extends AbstractNetClientService implements INetClientService
{
    private http!: AxiosInstance;
    private socket!: Socket;

    protected override continueInit(): void
    {
        this.http = axios.create({baseURL: this.netClientServiceConfig.httpBaseUrl});

        this.initSuccess();
    }

    public override connect(): INetClientService
    {
        if (this._isConnected)
        {
            this.warn("Client already connected to socket server!");
        }
        else
        {
            this.socket = io(this.netClientServiceConfig.socketUri);
            this.socket.on("connect", () =>
            {
                this.socket.on("data", data =>
                {
                    this._responseData = {
                        action: data.action,
                        requestType: ClientServiceRequestType.TCP,
                        data: data.data
                    };

                    this.dispatchMessage(NetClientServiceMessageType.TCP_RESPONSE, this._responseData);
                });

                this.socket.on("disconnect", () =>
                {
                    this._isConnected = false;

                    this.dispatchMessage(NetClientServiceMessageType.DISCONNECTED);
                });

                this._isConnected = true;

                this.info("Client connected to socket server:", this.netClientServiceConfig.socketUri);

                this.dispatchMessage(NetClientServiceMessageType.CONNECTED);
            });
        }

        return this;
    }

    public override disconnect(): INetClientService
    {
        if (!this.checkConnected()) return this;

        this.socket.disconnect();

        return this;
    }

    private async _sendHttpRequest<TData>(action: string, requestType: ClientServiceRequestType | undefined, data?: TData)
    {
        let url: string = action;
        let queryString: string;

        if (!requestType) requestType = ClientServiceRequestType.GET;

        if (requestType === ClientServiceRequestType.GET)
        {
            if (data)
            {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                queryString = new URLSearchParams(data).toString();

                if (queryString) url += "?" + queryString;
            }
        }

        try
        {
            const response = await (requestType === ClientServiceRequestType.GET ? this.http.get(url) :
                this.http.post(url, data));

            this._responseData = {action: action, requestType: requestType, data: response.data};

            this.dispatchMessage(NetClientServiceMessageType.HTTP_RESPONSE, this._responseData);
        } catch (e)
        {
            this.warn("Http request error:", action, requestType, data, e);

            this.dispatchMessage(NetClientServiceMessageType.HTTP_ERROR);
        }
    }

    protected override sendHttpRequest<TData>(action: string, requestType: ClientServiceRequestType | undefined, data?: TData): void
    {
        this._sendHttpRequest(action, requestType, data);
    }

    protected override sendTcpRequest<TData>(action: string, data?: TData): void
    {
        if (!this.checkConnected()) return;

        this.socket.emit("data", {action: action, data: data});
    }
}