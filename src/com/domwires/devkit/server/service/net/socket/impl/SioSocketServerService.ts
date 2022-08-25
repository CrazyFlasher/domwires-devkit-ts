import {AbstractNetServerService} from "../../AbstractNetServerService";
import {
    ISocketServerService,
    SocketRequestResponseType,
    SocketServerServiceConfig,
    SocketServerServiceMessageType
} from "../ISocketServerService";
import {INetServerService, NetServerServiceMessageType} from "../../INetServerService";
import {inject, named} from "inversify";
import {Server, Socket} from "socket.io";
import {Class} from "domwires";
import { DW_TYPES } from "../../../../../common/dw_consts";
import {RequestResponse} from "../../../../../common/net/RequestResponse";

// TODO: make final
export class SioSocketServerService<ClientDataType> extends AbstractNetServerService<SocketRequestResponseType> implements ISocketServerService<ClientDataType>
{
    @inject(DW_TYPES.SocketServerServiceConfig)
    private socketServerServiceConfig!: SocketServerServiceConfig;

    @inject(DW_TYPES.Class) @named("clientDataClass")
    private clientImpl!: Class<ClientDataType>;

    private server!: Server;
    private _connectedClientId!: string;
    private _disconnectedClientId!: string;
    private _requestFromClientId!: string;

    private clientIdToDataMap: Map<string, ClientDataType> = new Map<string, ClientDataType>();

    protected override createServer()
    {
        if (!this.socketServerServiceConfig.http)
        {
            this.info("No http server specified. Creating");
        }
        else
        {
            this.info("Using created http server");
        }

        this.server = new Server(this.socketServerServiceConfig.http);
        this.server.listen(this.socketServerServiceConfig.port);

        this.openSuccess();
    }

    protected override openSuccess()
    {
        this.createListeners();

        this.initSuccess();

        super.openSuccess();
    }

    private createListeners()
    {
        this.server.on("connection", socket =>
        {
            socket.on("disconnect", (reason) =>
            {
                this.info("Client disconnected:", socket.id, reason);

                this._disconnectedClientId = socket.id;

                this.clientIdToDataMap.delete(this._disconnectedClientId);

                this.dispatchMessage(SocketServerServiceMessageType.CLIENT_DISCONNECTED);
            });

            socket.on("data", (json) =>
            {
                if (json)
                {
                    this.info("Data received:", json, "\n", "Client id:", socket.id);
                }

                if (!json.id)
                {
                    this.warn("Request should be a json and contain 'id' field");
                }
                else
                {
                    const req = this.reqMap.get(json.id);
                    if (req)
                    {
                        this._requestFromClientId = socket.id;
                        this._requestData = {id: json.id, data: json.data, type: SocketRequestResponseType.TCP};

                        this.dispatchMessage(NetServerServiceMessageType.GOT_REQUEST);
                    }
                    else
                    {
                        this.warn("Ignoring socket request: " + json.id);
                    }
                }
            });

            this.info("Client connected:", socket.id);

            this._connectedClientId = socket.id;

            this.clientIdToDataMap.set(this._connectedClientId, this.factory.getInstance<ClientDataType>(this.clientImpl));

            this.dispatchMessage(SocketServerServiceMessageType.CLIENT_CONNECTED);
        });
    }

    public override close(): INetServerService<SocketRequestResponseType>
    {
        if (this._isOpened)
        {
            this.server.close(err =>
            {
                if (err)
                {
                    this.closeFail(err);
                }
                else
                {
                    this.closeSuccess();
                }
            });
        }

        return this;
    }

    public get connectedClientId(): string
    {
        return this._connectedClientId;
    }

    public get connectionsCount(): number
    {
        return this.server.sockets.sockets.size;
    }

    public disconnectAllClients(): ISocketServerService<ClientDataType>
    {
        if (this.checkIsOpened())
        {
            this.server.disconnectSockets(true);
        }

        return this;
    }

    public disconnectClient(clientId: string): ISocketServerService<ClientDataType>
    {
        if (this.checkIsOpened())
        {
            const socket = this.server.sockets.sockets.get(clientId);
            if (socket)
            {
                this.info("Disconnecting client:", clientId);
                socket.disconnect(true);
            }
            else
            {
                this.warn("Cannot disconnect client. Not found:", clientId);
            }
        }

        return this;
    }

    public get disconnectedClientId(): string
    {
        return this._disconnectedClientId;
    }

    public getClientDataById(clientId: string): ClientDataType | undefined
    {
        if (this.checkIsOpened())
        {
            const clientData = this.clientIdToDataMap.get(clientId);

            if (!clientData)
            {
                this.warn("Client not found:", clientId);

                return undefined;
            }

            return this.clientIdToDataMap.get(clientId);
        }

        return undefined;
    }

    public get requestFromClientId(): string
    {
        return this._requestFromClientId;
    }

    public sendResponse(clientId: string, response: RequestResponse<SocketRequestResponseType>): ISocketServerService<ClientDataType>
    {
        if (this.checkIsOpened())
        {
            const socket = this.getSocketClientById(clientId);
            if (socket)
            {
                socket.emit("data", response);

                this.dispatchMessage(NetServerServiceMessageType.SENT_RESPONSE);
            }
        }
        return this;
    }

    private getSocketClientById(clientId: string): Socket | undefined
    {
        const socket = this.server.sockets.sockets.get(clientId);
        if (!socket)
        {
            this.warn("Socket client not found:", clientId);
        }

        return socket;
    }
}
