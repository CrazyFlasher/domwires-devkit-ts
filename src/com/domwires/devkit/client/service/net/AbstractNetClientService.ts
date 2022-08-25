/* eslint-disable @typescript-eslint/no-unused-vars */

import {AbstractService} from "../../../common/service/AbstractService";
import {
    ClientServiceRequestType,
    INetClientService,
    NetClientServiceConfig
} from "./INetClientService";
import {inject} from "inversify";
import {RequestResponse} from "../../../common/net/RequestResponse";
import { DW_TYPES } from "../../../common/dw_consts";
import { DwError } from "../../../common/DwError";

export abstract class AbstractNetClientService extends AbstractService implements INetClientService
{
    @inject(DW_TYPES.NetClientServiceConfig)
    protected netClientServiceConfig!: NetClientServiceConfig;

    protected _responseData!: RequestResponse<ClientServiceRequestType>;
    protected _isConnected!: boolean;

    public connect(): INetClientService
    {
        throw new Error(DwError.OVERRIDE.name);
    }

    public disconnect(): INetClientService
    {
        throw new Error(DwError.OVERRIDE.name);
    }

    public get isConnected(): boolean
    {
        return this._isConnected;
    }

    public get responseData(): RequestResponse<ClientServiceRequestType>
    {
        return this._responseData;
    }

    public send<ReqResDataType>(request: RequestResponse<ClientServiceRequestType, ReqResDataType>): INetClientService
    {
        if (!this.checkEnabled())
        {
            return this;
        }

        if (this.isHttp(request.type))
        {
            this.sendHttpRequest(request);
        }
        else
        {
            if (this.checkConnected())
            {
                this.sendTcpRequest(request);
            }
        }

        return this;
    }

    protected sendTcpRequest(request: RequestResponse<ClientServiceRequestType>): void
    {
        throw new Error(DwError.OVERRIDE.name);
    }

    protected sendHttpRequest(request: RequestResponse<ClientServiceRequestType>): void
    {
        throw new Error(DwError.OVERRIDE.name);
    }

    protected checkConnected(): boolean
    {
        if (!this.checkEnabled()) return false;

        if (!this._isConnected)
        {
            this.warn("Not connected to socket server!");

            return false;
        }

        return true;
    }

    protected isHttp(type: ClientServiceRequestType): boolean
    {
        return type != ClientServiceRequestType.TCP;
    }
}