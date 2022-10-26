/* eslint-disable @typescript-eslint/no-unused-vars */

import {Enum, MessageType} from "domwires";
import {INetServerService, INetServerServiceImmutable, NetServerServiceConfig} from "../INetServerService";

export type Query = {
    readonly id?: Enum;
    readonly relatedToClientId?: string;
};

export type DataBaseServiceConfig = NetServerServiceConfig & {
    readonly dataBaseName: string;
};

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
    get deleteResult(): number;

    get query(): Query | undefined;

    getFindResult<T>(): T;

    find<T>(query: Query, collectionName: string, filter: T, limit?: number, sort?: { field: string; ascending?: boolean }): void;
}

export interface IDataBaseService extends IDataBaseServiceImmutable, INetServerService
{
    createCollection(list: { name: string; uniqueIndexList?: string[] }[]): void;

    dropCollection(name: string): void;

    insert<T>(query: Query, collectionName: string, itemList: ReadonlyArray<T>): void;

    update<T>(collectionName: string, filter: T, updateFilter: UpdateOperator<T>): void;

    delete<T>(collectionName: string, filter: T): void;
}