import {IService, IServiceImmutable, ServiceConfig} from "../../../../common/service/IService";
import {Enum, MessageType} from "domwires";
import {HttpMethod} from "./http/IHttpServerService";

export type NetServerServiceConfig = ServiceConfig & {
    readonly host: string;
    readonly port: number;
};

export type RequestData<TData = string> = {
    readonly action: string;
    readonly data?: TData;
    readonly method?: HttpMethod;
};

export class NetServerServiceMessageType extends MessageType
{
    public static readonly GOT_REQUEST: NetServerServiceMessageType = new NetServerServiceMessageType();
    public static readonly SEND_RESPONSE: NetServerServiceMessageType = new NetServerServiceMessageType();
    public static readonly OPEN_SUCCESS: NetServerServiceMessageType = new NetServerServiceMessageType();
    public static readonly OPEN_FAIL: NetServerServiceMessageType = new NetServerServiceMessageType();
    public static readonly CLOSE_SUCCESS: NetServerServiceMessageType = new NetServerServiceMessageType();
    public static readonly CLOSE_FAIL: NetServerServiceMessageType = new NetServerServiceMessageType();
}

export interface INetServerServiceImmutable extends IServiceImmutable
{
    getRequestData<TData>(): RequestData<TData>;

    isListening(action: Enum): boolean;

    isListening(actionName: string): boolean;

    get isOpened(): boolean;

    get port(): number;

    get host(): string;
}

export interface INetServerService extends INetServerServiceImmutable, IService
{
    startListen(actionList: Enum[]): INetServerService;

    stopListen(actionList: Enum[]): INetServerService;

    close(): INetServerService;
}