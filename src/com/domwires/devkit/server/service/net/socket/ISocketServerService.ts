import {
    INetServerService,
    INetServerServiceImmutable,
    NetServerServiceConfig,
} from "../INetServerService";
import {Server} from "http";
import {Enum} from "domwires";
import {RequestResponse} from "../../../../common/net/RequestResponse";

export class SocketRequestResponseType extends Enum
{
    public static readonly TCP: SocketRequestResponseType = new SocketRequestResponseType();
}

export type SocketServerServiceConfig = NetServerServiceConfig & {
    readonly http?: Server;
};

export class SocketServerServiceMessageType extends Enum
{
    public static readonly CLIENT_CONNECTED: SocketServerServiceMessageType = new SocketServerServiceMessageType();
    public static readonly CLIENT_DISCONNECTED: SocketServerServiceMessageType = new SocketServerServiceMessageType();
}

export interface ISocketServerServiceImmutable<ClientDataType> extends INetServerServiceImmutable<SocketRequestResponseType>
{
    get connectionsCount(): number;

    get connectedClientId(): string;

    get disconnectedClientId(): string;

    get requestFromClientId(): string;

    getClientDataById(clientId: string): ClientDataType;
}

export interface ISocketServerService<ClientDataType> extends ISocketServerServiceImmutable<ClientDataType>, INetServerService<SocketRequestResponseType>
{
    sendResponse(clientId: string, response: RequestResponse<SocketRequestResponseType>): ISocketServerService<ClientDataType>;

    disconnectClient(clientId: string): ISocketServerService<ClientDataType>;

    disconnectAllClients(): ISocketServerService<ClientDataType>;
}
