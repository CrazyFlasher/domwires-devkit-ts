/* eslint-disable @typescript-eslint/no-unused-vars */

import {AbstractService} from "../../../../common/service/AbstractService";
import {ClientServiceRequestType, INetClientService, NetClientServiceConfig, ResponseData} from "./INetClientService";
import {inject} from "inversify";
import {DwError} from "../../../../common/DwError";
import {Types} from "../../../../common/Types";
import {serviceIdentifier} from "domwires/dist/com/domwires/core/Decorators";

@serviceIdentifier(Types.INetClientService)
export abstract class AbstractNetClientService extends AbstractService implements INetClientService
{
    @inject(Types.ServiceConfig)
    protected netClientServiceConfig!: NetClientServiceConfig;

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    protected _responseData!: ResponseData<any>;
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

    public getResponseData<TData>(): ResponseData<TData>
    {
        return this._responseData;
    }

    public send<TData>(action: string, data?: TData, requestType?: ClientServiceRequestType): INetClientService
    {
        if (!this.checkEnabled())
        {
            return this;
        }

        if (requestType != ClientServiceRequestType.TCP)
        {
            this.sendHttpRequest(action, requestType, data);
        }
        else
        {
            if (this.checkConnected())
            {
                this.sendTcpRequest(action, data);
            }
        }

        return this;
    }

    protected sendTcpRequest<TData>(action: string, data?: TData): void
    {
        throw new Error(DwError.OVERRIDE.name);
    }

    protected sendHttpRequest<TData>(action: string, requestType: ClientServiceRequestType | undefined, data?: TData): void
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
}