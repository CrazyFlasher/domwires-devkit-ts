import {IHierarchyObject, IHierarchyObjectImmutable, MessageType} from "domwires";

export type ServiceConfig = {
    readonly enabled?: boolean;
};

export class ServiceMessageType extends MessageType
{
    public static readonly INIT_SUCCESS: ServiceMessageType = new ServiceMessageType();
    public static readonly INIT_FAIL: ServiceMessageType = new ServiceMessageType();
}

export interface IServiceImmutable extends IHierarchyObjectImmutable
{
    get initialized(): boolean;

    get enabled(): boolean;
}

export interface IService extends IServiceImmutable, IHierarchyObject
{
    isIService(): void;
    init(): IService;
}