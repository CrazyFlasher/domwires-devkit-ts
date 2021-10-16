import {Enum, IModel, IModelImmutable} from "domwires";

export type ServiceConfig = {
    readonly enabled: boolean;
};

export class ServiceMessageType extends Enum
{
    public static readonly INIT_SUCCESS:ServiceMessageType = new ServiceMessageType("INIT_SUCCESS");
    public static readonly INIT_FAIL:ServiceMessageType = new ServiceMessageType("INIT_FAIL");
}

export interface IServiceImmutable extends IModelImmutable
{
    get config(): ServiceConfig;

    get initialized(): boolean;
}

export interface IService extends IServiceImmutable, IModel
{
    init(): IService;
}