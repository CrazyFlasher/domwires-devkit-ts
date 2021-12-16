import {IService, IServiceImmutable, ServiceConfig} from "../IService";
import {RequestResponse} from "../net/INetServerService";
import {Enum} from "domwires";

export type NetClientServiceConfig = ServiceConfig & {
    readonly httpBaseUrl: string;
    readonly socketUri: string;
};

export class ClientServiceRequestType extends Enum
{
    // This prop is needed for transpiler to define ClientServiceRequestType as unique type
    private readonly instance: ClientServiceRequestType;

    public static readonly GET: ClientServiceRequestType = new ClientServiceRequestType();
    public static readonly POST: ClientServiceRequestType = new ClientServiceRequestType();
    public static readonly TCP: ClientServiceRequestType = new ClientServiceRequestType();
}

export class NetClientServiceMessageType extends Enum
{
    public static readonly CONNECTED: NetClientServiceMessageType = new NetClientServiceMessageType();
    public static readonly DISCONNECTED: NetClientServiceMessageType = new NetClientServiceMessageType();
    public static readonly HTTP_RESPONSE: NetClientServiceMessageType = new NetClientServiceMessageType();
    public static readonly TCP_RESPONSE: NetClientServiceMessageType = new NetClientServiceMessageType();
    public static readonly HTTP_ERROR: NetClientServiceMessageType = new NetClientServiceMessageType();
}

export interface INetClientServiceImmutable extends IServiceImmutable
{
    get isConnected(): boolean;

    get responseData(): RequestResponse<ClientServiceRequestType>;
}

export interface INetClientService extends IService, INetClientServiceImmutable
{
    connect(): INetClientService;

    disconnect(): INetClientService;

    send(request: RequestResponse<ClientServiceRequestType>): INetClientService;
}