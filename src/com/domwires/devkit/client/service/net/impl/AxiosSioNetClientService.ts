import {AbstractNetClientService} from "../AbstractNetClientService";
import {ClientServiceRequestType, INetClientService, NetClientServiceMessageType} from "../INetClientService";
import axios, {AxiosInstance} from "axios";
import * as querystring from "querystring";
import {io, Socket} from "socket.io-client";
import { RequestResponse } from "../../../../common/net/RequestResponse";

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
                    this._responseData = {id: data.id, type: ClientServiceRequestType.TCP, data: data.data};

                    this.dispatchMessage(NetClientServiceMessageType.TCP_RESPONSE, this._responseData);
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
        // this.socket = undefined;

        this._isConnected = false;

        this.dispatchMessage(NetClientServiceMessageType.DISCONNECTED);

        return this;
    }

    private async _sendHttpRequest(request: RequestResponse<ClientServiceRequestType>)
    {
        let url: string = request.id;

        if (request.type === ClientServiceRequestType.GET)
        {
            const queryString = querystring.stringify(request.data);

            if (queryString) url += "?" + queryString;
        }

        try
        {
            const response = await (request.type === ClientServiceRequestType.GET ? this.http.get(url) :
                this.http.post(url, request.data));

            this._responseData = {id: request.id, type: request.type, data: response.data};

            this.dispatchMessage(NetClientServiceMessageType.HTTP_RESPONSE, this._responseData);
        } catch (e)
        {
            this.info("Http request error:", request, e);

            this.dispatchMessage(NetClientServiceMessageType.HTTP_ERROR);
        }
    }

    protected override sendHttpRequest(request: RequestResponse<ClientServiceRequestType>): void
    {
        this._sendHttpRequest(request);
    }

    protected override sendTcpRequest(request: RequestResponse<ClientServiceRequestType>): void
    {
        if (!this.checkConnected()) return;

        this.socket.emit("data", {id: "test", data: request.data});
    }
}