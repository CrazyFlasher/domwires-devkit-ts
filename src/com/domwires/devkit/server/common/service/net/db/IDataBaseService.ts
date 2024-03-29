import {Enum, MessageType} from "domwires";
import {INetServerService, INetServerServiceImmutable, NetServerServiceConfig} from "../INetServerService";
import {ObjectId} from "bson";

export class DataBaseErrorReason extends Enum
{
    public static readonly DATABASE_SERVICE_CLOSED: DataBaseErrorReason = new DataBaseErrorReason("DATABASE_SERVICE_CLOSED");
    public static readonly NOT_FOUND: DataBaseErrorReason = new DataBaseErrorReason("NOT_FOUND");
    public static readonly VALIDATION_FAILED: DataBaseErrorReason = new DataBaseErrorReason("VALIDATION_FAILED");
    public static readonly DUPLICATE: DataBaseErrorReason = new DataBaseErrorReason("DUPLICATE");
    public static readonly UPDATE_FAILED: DataBaseErrorReason = new DataBaseErrorReason("UPDATE_FAILED");
    public static readonly DELETE_FAILED: DataBaseErrorReason = new DataBaseErrorReason("DELETE_FAILED");
    public static readonly CREATE_COLLECTION_FAILED: DataBaseErrorReason = new DataBaseErrorReason("CREATE_COLLECTION_FAILED");
    public static readonly DROP_COLLECTION_FAILED: DataBaseErrorReason = new DataBaseErrorReason("DROP_COLLECTION_FAILED");
}

export type Query<TData = void> = {
    readonly id?: Enum;
    readonly relatedToClientId?: string;
    readonly data?: TData;
};

export type DataBaseServiceConfig = NetServerServiceConfig & {
    readonly dataBaseName: string;
};

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export class DataBaseServiceMessageType<T = void> extends MessageType
{
    public static readonly INSERT_SUCCESS: DataBaseServiceMessageType = new DataBaseServiceMessageType();
    public static readonly FIND_SUCCESS: MessageType<unknown[]> = new DataBaseServiceMessageType<unknown[]>();
    public static readonly UPDATE_SUCCESS: DataBaseServiceMessageType = new DataBaseServiceMessageType();
    public static readonly DELETE_SUCCESS: MessageType<number> = new DataBaseServiceMessageType<number>();
    public static readonly DROP_COLLECTION_SUCCESS: DataBaseServiceMessageType = new DataBaseServiceMessageType();
    public static readonly CREATE_COLLECTION_SUCCESS: DataBaseServiceMessageType = new DataBaseServiceMessageType();

    public static readonly INSERT_FAIL: DataBaseServiceMessageType = new DataBaseServiceMessageType();
    public static readonly FIND_FAIL: DataBaseServiceMessageType = new DataBaseServiceMessageType();
    public static readonly UPDATE_FAIL: DataBaseServiceMessageType = new DataBaseServiceMessageType();
    public static readonly DELETE_FAIL: DataBaseServiceMessageType = new DataBaseServiceMessageType();
    public static readonly DROP_COLLECTION_FAIL: DataBaseServiceMessageType = new DataBaseServiceMessageType();
    public static readonly CREATE_COLLECTION_FAIL: DataBaseServiceMessageType = new DataBaseServiceMessageType();
    public static readonly CREATE_COLLECTION_LIST_COMPLETE: DataBaseServiceMessageType = new DataBaseServiceMessageType();
}

export type FilterOperator = {
    /**
     * Matches values that are equal to a specified value.
     */
    readonly $equals?: number | string | boolean;

    /**
     * Matches all values that are not equal to a specified value.
     */
    readonly $notEqual?: number | string | boolean;

    /**
     * Matches values that are greater than a specified value.
     */
    readonly $greater?: number;

    /**
     * Matches values that are greater than or equal to a specified value.
     */
    readonly $greaterOrEquals?: number;

    /**
     * Matches values that are less than a specified value.
     */
    readonly $less?: number;

    /**
     * Matches values that are less than or equal to a specified value.
     */
    readonly $lessOrEquals?: number;

    /**
     * Selects documents where values match a specified regular expression.
     */
    readonly $regexMatch?: string;

    /**
     * Matches any of the values specified in an array.
     */
    readonly $inArray?: number | string;

    /**
     * Matches none of the values specified in an array.
     */
    readonly $noneInArray?: number[] | string[] | boolean[];
};

export type UpdateOperator<T> = {

    /**
     * Sets the value of a field in a document.
     */
    readonly $set?: T;

    /**
     * Increments the value of the field by the specified amount.
     */
    readonly $increase?: T;

    /**
     * Only updates the field if the specified value is less than the existing field value.
     */
    readonly $updateIfLess?: T;

    /**
     * Only updates the field if the specified value is greater than the existing field value.
     */
    readonly $updateIfGreater?: T;

    /**
     * Multiplies the value of the field by the specified amount.
     */
    readonly $multiply?: T;

    /**
     * Renames a field.
     */
    readonly $rename?: T;

    /**
     * Removes the specified field from a document.
     */
    readonly $removeField?: T;
};

export interface IDataBaseServiceImmutable extends INetServerServiceImmutable
{
    find<TFilter, TEntity extends TFilter = TFilter, TData = void, P = void>
    (collectionName: string, filter: TFilter, projection?: P, query?: Query<TData>, limit?: number, sort?: { field: string; ascending?: boolean }):
        Promise<{ query?: Query<TData>; result?: TEntity[]; errorReason?: DataBaseErrorReason }>;
}

export interface IDataBaseService extends IDataBaseServiceImmutable, INetServerService
{
    createCollection(list: { name: string; uniqueIndexList?: string[]; mandatoryFields?: string[] }[]):
        Promise<{ result?: boolean; errorReason?: DataBaseErrorReason }>;

    dropCollection(name: string): Promise<{ result?: boolean; errorReason?: DataBaseErrorReason }>;

    insert<TEntity, TData = void>(collectionName: string, itemList: ReadonlyArray<TEntity>, query?: Query<TData>):
        Promise<{ query?: Query<TData>; result?: ObjectId[] | ObjectId; errorReason?: DataBaseErrorReason }>;

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    update<TFilter, TEntity extends TFilter = TFilter, TUFilter = TEntity, TData = void>
    (collectionName: string, filter: TFilter, updateFilter: UpdateOperator<TUFilter>, query?: Query<TData>, many?: boolean):
        Promise<{ query?: Query<TData>; result?: boolean; errorReason?: DataBaseErrorReason }>;

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    delete<TFilter, TEntity extends TFilter = TFilter, TData = void>(collectionName: string, filter: TFilter, query?: Query<TData>, many?: boolean):
        Promise<{ query?: Query<TData>; result?: number; errorReason?: DataBaseErrorReason }>;
}