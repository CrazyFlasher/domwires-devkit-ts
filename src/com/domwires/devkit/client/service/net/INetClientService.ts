/* eslint-disable @typescript-eslint/no-unused-vars */

import {IService, IServiceImmutable, ServiceConfig} from "../../../common/service/IService";
import {Enum} from "domwires";
import { RequestResponse } from "../../../common/net/RequestResponse";

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

export class NetClientServiceMessageType<T = void> extends Enum
{
    public static readonly CONNECTED: NetClientServiceMessageType = new NetClientServiceMessageType();
    public static readonly DISCONNECTED: NetClientServiceMessageType = new NetClientServiceMessageType();
    public static readonly HTTP_RESPONSE: Enum<RequestResponse<ClientServiceRequestType>> = new NetClientServiceMessageType();
    public static readonly TCP_RESPONSE: Enum<RequestResponse<ClientServiceRequestType>> = new NetClientServiceMessageType();
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

    send<ReqResDataType>(request: RequestResponse<ClientServiceRequestType, ReqResDataType>): INetClientService;
}