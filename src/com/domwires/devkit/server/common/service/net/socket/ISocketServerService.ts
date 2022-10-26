import {
    INetServerService,
    INetServerServiceImmutable,
    NetServerServiceConfig,
    RequestData,
} from "../INetServerService";
import {Server} from "http";
import {MessageType} from "domwires";

export type SocketServerServiceConfig = NetServerServiceConfig & {
    readonly http?: Server;
};

export class SocketServerServiceMessageType extends MessageType
{
    public static readonly CLIENT_CONNECTED: SocketServerServiceMessageType = new SocketServerServiceMessageType();
    public static readonly CLIENT_DISCONNECTED: SocketServerServiceMessageType = new SocketServerServiceMessageType();
}

export interface ISocketServerServiceImmutable extends INetServerServiceImmutable
{
    get connectionsCount(): number;

    get connectedClientId(): string;

    get disconnectedClientId(): string;

    get requestFromClientId(): string;
}

export interface ISocketServerService extends ISocketServerServiceImmutable, INetServerService
{
    sendResponse<TData>(clientId: string, data: RequestData<TData>): ISocketServerService;

    disconnectClient(clientId: string): ISocketServerService;

    disconnectAllClients(): ISocketServerService;
}
