import {AbstractNetServerService} from "../../AbstractNetServerService";
import {ISocketServerService, SocketServerServiceConfig, SocketServerServiceMessageType} from "../ISocketServerService";
import {INetServerService, NetServerServiceMessageType, RequestData} from "../../INetServerService";
import {inject} from "inversify";
import {Server, Socket} from "socket.io";
import {Types} from "../../../../../../common/Types";

// TODO: make final
export class SioSocketServerService extends AbstractNetServerService implements ISocketServerService
{
    @inject(Types.ServiceConfig)
    private socketServerServiceConfig!: SocketServerServiceConfig;

    private util = require("util");

    private server!: Server;
    private _connectedClientId!: string;
    private _disconnectedClientId!: string;
    private _requestFromClientId!: string;

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

        try
        {
            this.server = new Server(this.socketServerServiceConfig.http);
            this.server.listen(this.socketServerServiceConfig.port);

            this.openSuccess();
        } catch (e)
        {
            this.openFail(e);
        }
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

                this.dispatchMessage(SocketServerServiceMessageType.CLIENT_DISCONNECTED);
            });

            socket.on("data", (json) =>
            {
                if (json)
                {
                    this.info("Data received:", this.util.inspect(json), "\n", "Client id:", socket.id);
                }

                if (!json.action)
                {
                    this.warn("Request should be a json and contain 'action' field");
                }
                else
                {
                    if (this.isListening(json.action))
                    {
                        this._requestFromClientId = socket.id;
                        this._requestData = {action: json.action, data: json.data};

                        this.dispatchMessage(NetServerServiceMessageType.GOT_REQUEST);
                    }
                    else
                    {
                        this.warn("Ignoring socket request: " + json.action);
                    }
                }
            });

            this.info("Client connected:", socket.id);

            this._connectedClientId = socket.id;

            this.dispatchMessage(SocketServerServiceMessageType.CLIENT_CONNECTED);
        });
    }

    public override close(): INetServerService
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

    public disconnectAllClients(): ISocketServerService
    {
        if (this.checkIsOpened())
        {
            this.server.disconnectSockets(true);
        }

        return this;
    }

    public disconnectClient(clientId: string): ISocketServerService
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

    public get requestFromClientId(): string
    {
        return this._requestFromClientId;
    }

    public sendResponse<TData>(clientId: string, data: RequestData<TData>): ISocketServerService
    {
        if (this.checkIsOpened())
        {
            const socket = this.getSocketClientById(clientId);
            if (socket)
            {
                socket.emit("data", data);

                this.dispatchMessage(NetServerServiceMessageType.SEND_RESPONSE);
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
