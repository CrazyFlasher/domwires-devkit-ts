import {IService, IServiceImmutable, ServiceConfig} from "../../IService";
import {Enum} from "domwires";

export type NetServerServiceConfig = ServiceConfig & {
    readonly host: string;
    readonly port: number;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: remove default any
export type RequestResponse<TypeType, DataType = any> = {
    readonly id: string;
    readonly type: TypeType;
    readonly data?: DataType;
};

export class NetServerServiceMessageType extends Enum
{
    public static readonly GOT_REQUEST: NetServerServiceMessageType = new NetServerServiceMessageType();
    public static readonly SENT_RESPONSE: NetServerServiceMessageType = new NetServerServiceMessageType();
    public static readonly OPEN_SUCCESS: NetServerServiceMessageType = new NetServerServiceMessageType();
    public static readonly OPEN_FAIL: NetServerServiceMessageType = new NetServerServiceMessageType();
    public static readonly CLOSE_SUCCESS: NetServerServiceMessageType = new NetServerServiceMessageType();
    public static readonly CLOSE_FAIL: NetServerServiceMessageType = new NetServerServiceMessageType();
}

export interface INetServerServiceImmutable<ReqResType> extends IServiceImmutable
{
    get requestData(): RequestResponse<ReqResType>;

    isListening(request: RequestResponse<ReqResType>): boolean;

    get isOpened(): boolean;
}

export interface INetServerService<ReqResType> extends INetServerServiceImmutable<ReqResType>, IService
{
    startListen(request: RequestResponse<ReqResType>): INetServerService<ReqResType>;

    stopListen(request: RequestResponse<ReqResType>): INetServerService<ReqResType>;

    close(): INetServerService<ReqResType>;
}