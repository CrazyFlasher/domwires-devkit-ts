/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {IService, IServiceImmutable, ServiceConfig} from "../../../../common/service/IService";
import {Enum, MessageType} from "domwires";

export type NetClientServiceConfig = ServiceConfig & {
    readonly httpBaseUrl: string;
    readonly socketUri: string;
};

export class ClientServiceRequestType extends Enum
{
    // This prop is needed for transpiler to define ClientServiceRequestType as unique type
    private readonly instance!: ClientServiceRequestType;

    public static readonly GET: ClientServiceRequestType = new ClientServiceRequestType();
    public static readonly POST: ClientServiceRequestType = new ClientServiceRequestType();
    public static readonly TCP: ClientServiceRequestType = new ClientServiceRequestType();
}

export type ResponseData<TData = string> = {
    readonly action: string;
    readonly requestType: ClientServiceRequestType;
    readonly data: TData;
};

export class NetClientServiceMessageType<T = void> extends MessageType
{
    public static readonly CONNECTED: NetClientServiceMessageType = new NetClientServiceMessageType();
    public static readonly DISCONNECTED: NetClientServiceMessageType = new NetClientServiceMessageType();
    public static readonly HTTP_RESPONSE: MessageType<ResponseData> = new NetClientServiceMessageType();
    public static readonly TCP_RESPONSE: MessageType<ResponseData> = new NetClientServiceMessageType();
    public static readonly HTTP_ERROR: NetClientServiceMessageType = new NetClientServiceMessageType();
}

export interface INetClientServiceImmutable extends IServiceImmutable
{
    get isConnected(): boolean;

    getResponseData<TData>():ResponseData<TData>;
}

export interface INetClientService extends IService, INetClientServiceImmutable
{
    connect(): INetClientService;

    disconnect(): INetClientService;

    send<TData>(action: string, data?: TData, requestType?: ClientServiceRequestType): INetClientService;
}