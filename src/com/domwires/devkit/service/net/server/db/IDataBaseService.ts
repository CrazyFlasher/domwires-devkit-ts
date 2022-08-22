/* eslint-disable @typescript-eslint/no-unused-vars */

import {IService, IServiceImmutable} from "../../../IService";
import {Enum} from "domwires";

export type DataBaseServiceConfig = {
    readonly uri: string;
    readonly dataBaseName: string;
};

export class DataBaseServiceMessageType<T = void> extends Enum
{
    public static readonly CONNECT_SUCCESS: DataBaseServiceMessageType = new DataBaseServiceMessageType();
    public static readonly DISCONNECT_SUCCESS: DataBaseServiceMessageType = new DataBaseServiceMessageType();
    public static readonly INSERT_SUCCESS: DataBaseServiceMessageType = new DataBaseServiceMessageType();
    public static readonly FIND_SUCCESS: Enum<unknown[]> = new DataBaseServiceMessageType<unknown[]>();
    public static readonly UPDATE_SUCCESS: DataBaseServiceMessageType = new DataBaseServiceMessageType();
    public static readonly DELETE_SUCCESS: Enum<number> = new DataBaseServiceMessageType<number>();
    public static readonly DROP_COLLECTION_SUCCESS: DataBaseServiceMessageType = new DataBaseServiceMessageType();
    public static readonly CREATE_COLLECTION_SUCCESS: DataBaseServiceMessageType = new DataBaseServiceMessageType();

    public static readonly CONNECT_FAIL: DataBaseServiceMessageType = new DataBaseServiceMessageType();
    public static readonly DISCONNECT_FAIL: DataBaseServiceMessageType = new DataBaseServiceMessageType();
    public static readonly INSERT_FAIL: DataBaseServiceMessageType = new DataBaseServiceMessageType();
    public static readonly FIND_FAIL: DataBaseServiceMessageType = new DataBaseServiceMessageType();
    public static readonly UPDATE_FAIL: DataBaseServiceMessageType = new DataBaseServiceMessageType();
    public static readonly DELETE_FAIL: DataBaseServiceMessageType = new DataBaseServiceMessageType();
    public static readonly DROP_COLLECTION_FAIL: DataBaseServiceMessageType = new DataBaseServiceMessageType();
    public static readonly CREATE_COLLECTION_FAIL: DataBaseServiceMessageType = new DataBaseServiceMessageType();
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

export interface IDataBaseServiceImmutable extends IServiceImmutable
{
    get isConnected(): boolean;
}

export interface IDataBaseService extends IDataBaseServiceImmutable, IService
{
    disconnect(): IDataBaseService;

    createCollection(name: string, uniqueIndexList?: string[]): IDataBaseService;

    dropCollection(name: string): IDataBaseService;

    insert<T>(collectionName: string, itemList: ReadonlyArray<T>): IDataBaseService;

    find<T>(collectionName: string, filter: T, limit?: number, sort?: { field: string; ascending?: boolean }): IDataBaseService;

    update<T>(collectionName: string, filter: T, updateFilter: UpdateOperator<T>): IDataBaseService;

    delete<T>(collectionName: string, filter: T): IDataBaseService;
}