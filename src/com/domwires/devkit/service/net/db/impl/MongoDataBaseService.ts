import {AbstractService} from "../../../AbstractService";
import {DataBaseServiceConfig, DataBaseServiceMessageType, IDataBaseService, UpdateOperator} from "../IDataBaseService";
import {inject} from "inversify";
import {DW_TYPES} from "../../../../dw_consts";
import {Db, Filter, FindCursor, FindOptions, MongoClient} from "mongodb";

// TODO: make final
export class MongoDataBaseService extends AbstractService implements IDataBaseService
{
    @inject(DW_TYPES.DataBaseServiceConfig)
    protected dataBaseServiceConfig: DataBaseServiceConfig;

    private _isConnected: boolean;

    private client: MongoClient;
    private db: Db;

    private readonly filterOperatorMap: Map<string, string> = new Map<string, string>([
        ["$equals", "$eq"],
        ["$notEqual", "$ne"],
        ["$greater", "$gt"],
        ["$greaterOrEquals", "$gte"],
        ["$less", "$lt"],
        ["$lessOrEquals", "$lte"],
        ["$regexMatch", "$regex"],
        ["$inArray", "$in"],
        ["$noneInArray", "$nin"]
    ]);

    private readonly updateOperatorMap: Map<string, string> = new Map<string, string>([
        ["$increase", "$inc"],
        ["$updateIfLess", "$min"],
        ["$updateIfGreater", "$max"],
        ["$multiply", "$mul"],
        ["$rename", "$rename"],
        ["$removeField", "$unset"]
    ]);

    protected override async continueInit()
    {
        this.client = new MongoClient(this.dataBaseServiceConfig.uri);

        try
        {
            await this.client.connect();

            this.db = this.client.db(this.dataBaseServiceConfig.dataBaseName);

            this.connectSuccess();
        } catch (e)
        {
            this.connectFail();
        }
    }

    public disconnect(): IDataBaseService
    {
        if (this.checkIsConnected())
        {
            this.client.close(error =>
            {
                if (error)
                {
                    this.logger.warn("Failed to disconnect");

                    this.dispatchMessage(DataBaseServiceMessageType.DISCONNECT_FAIL);
                }
                else
                {
                    this._isConnected = false;

                    this.dispatchMessage(DataBaseServiceMessageType.DISCONNECT_SUCCESS);
                }
            });
        }

        return this;
    }

    private async _createCollection(name: string, uniqueIndexList?: string[])
    {
        try
        {
            const resultCollection = await this.db.collection(name);

            if (uniqueIndexList != null && uniqueIndexList.length > 0)
            {
                await resultCollection.createIndex(uniqueIndexList, {unique: true});

                this.createTableSuccess();
            }
            else
            {
                this.createTableSuccess();
            }
        } catch (e)
        {
            this.logger.warn("Cannot create collection:", name, uniqueIndexList, e);

            this.dispatchMessage(DataBaseServiceMessageType.CREATE_COLLECTION_FAIL);
        }
    }

    public createCollection(name: string, uniqueIndexList?: string[]): IDataBaseService
    {
        if (!this.checkIsConnected()) return this;

        this._createCollection(name, uniqueIndexList);

        return this;
    }

    private createTableSuccess(): void
    {
        this.dispatchMessage(DataBaseServiceMessageType.CREATE_COLLECTION_SUCCESS);
    }

    private async _dropCollection(name: string)
    {
        try
        {
            await this.db.dropCollection(name);

            this.dispatchMessage(DataBaseServiceMessageType.DROP_COLLECTION_SUCCESS);
        } catch (e)
        {
            this.logger.error("Cannot drop collection:", name, e);

            this.dispatchMessage(DataBaseServiceMessageType.DROP_COLLECTION_FAIL);
        }
    }

    public dropCollection(name: string): IDataBaseService
    {
        if (!this.checkIsConnected()) return this;

        this._dropCollection(name);

        return this;
    }

    private async _insert<T>(collectionName: string, itemList: ReadonlyArray<T>)
    {
        try
        {
            await this.db.collection<T>(collectionName).insertMany(itemList as []);

            this.dispatchMessage(DataBaseServiceMessageType.INSERT_SUCCESS);
        } catch (e)
        {
            this.logger.warn("Cannot insert:", collectionName, itemList, e);

            this.dispatchMessage(DataBaseServiceMessageType.INSERT_FAIL);
        }
    }

    public insert<T>(collectionName: string, itemList: ReadonlyArray<T>): IDataBaseService
    {
        if (!this.checkIsConnected()) return this;

        this._insert<T>(collectionName, itemList);

        return this;
    }

    private async _find<T>(collectionName: string, filter: T, limit?: number, sort?: { field: string; ascending?: boolean })
    {
        try
        {
            let opts: FindOptions;
            if (limit !== undefined || sort)
            {
                opts = {};
                if (limit !== undefined)
                {
                    opts.limit = limit;
                }
                if (sort)
                {
                    opts.sort = {[sort.field]: sort.ascending ? 1 : -1};
                }
            }

            const cursor: FindCursor = await this.db.collection<T>(collectionName)
                .find<T>(this.toMongoOperators(filter, this.filterOperatorMap), opts);

            if (await cursor.count() === 0)
            {
                this.logger.warn("Nothing found:", collectionName, filter);

                this.dispatchMessage(DataBaseServiceMessageType.FIND_FAIL);
            }
            else
            {
                const result = await cursor.toArray();

                this.dispatchMessage(DataBaseServiceMessageType.FIND_SUCCESS, result);
            }
        } catch (e)
        {
            this.logger.warn("Cannot find:", collectionName, filter, e);

            this.dispatchMessage(DataBaseServiceMessageType.FIND_FAIL);
        }
    }

    private toMongoOperators<T>(filter: T, operatorMap: Map<string, string>): Filter<T>
    {
        const out: Filter<T> = {};

        for (const key in filter)
        {
            out[key] = filter[key];

            if (typeof out[key] === "object")
            {
                operatorMap.forEach((v, k) =>
                {
                    MongoDataBaseService.replaceKey(out[key], k, v);
                });
            }
        }

        return out;
    }

    private toMongoUpdateOperators<T>(filter: UpdateOperator<T>, operatorMap: Map<string, string>): Filter<T>
    {
        const out: Filter<T> = {};

        for (const key in filter)
        {
            Object.defineProperty(out, key,
                Object.getOwnPropertyDescriptor(filter, key));

            operatorMap.forEach((v, k) =>
            {
                MongoDataBaseService.replaceKey(out, k, v);
            });
        }

        return out;
    }

    public find<T>(collectionName: string, filter: T, limit?: number, sort?: { field: string; ascending?: boolean }): IDataBaseService
    {
        if (!this.checkIsConnected()) return this;

        this._find<T>(collectionName, filter, limit, sort);

        return this;
    }

    private async _update<T>(collectionName: string, filter: T, updateFilter: UpdateOperator<T>)
    {
        try
        {
            await this.db.collection<T>(collectionName)
                .updateMany(this.toMongoOperators(filter, this.filterOperatorMap),
                    this.toMongoUpdateOperators(updateFilter, this.updateOperatorMap));

            this.dispatchMessage(DataBaseServiceMessageType.UPDATE_SUCCESS);
        } catch (e)
        {
            this.logger.warn("Cannot update:", collectionName, filter, updateFilter, e);

            this.dispatchMessage(DataBaseServiceMessageType.UPDATE_FAIL);
        }
    }

    public update<T>(collectionName: string, filter: T, updateFilter: UpdateOperator<T>): IDataBaseService
    {
        if (!this.checkIsConnected()) return this;

        this._update<T>(collectionName, filter, updateFilter);

        return this;
    }

    private async _delete<T>(collectionName: string, filter: T)
    {
        try
        {
            const result = await this.db.collection<T>(collectionName).deleteMany(this.toMongoOperators(filter, this.filterOperatorMap));

            this.dispatchMessage(DataBaseServiceMessageType.DELETE_SUCCESS, result.deletedCount);
        } catch (e)
        {
            this.logger.warn("Cannot delete:", collectionName, filter, e);

            this.dispatchMessage(DataBaseServiceMessageType.DELETE_FAIL);
        }
    }

    public delete<T>(collectionName: string, filter: T): IDataBaseService
    {
        if (!this.checkIsConnected()) return this;

        this._delete<T>(collectionName, filter);

        return this;
    }

    public get isConnected(): boolean
    {
        return this._isConnected;
    }

    private checkIsConnected(): boolean
    {
        if (!this.checkEnabled() || !this.checkInitialized()) return false;

        if (!this._isConnected)
        {
            this.logger.warn("Not connected to database");

            return false;
        }

        return true;
    }

    private connectSuccess(): void
    {
        this.initSuccess();

        this._isConnected = true;

        this.dispatchMessage(DataBaseServiceMessageType.CONNECT_SUCCESS);
    }

    private connectFail(): void
    {
        this.logger.warn("Failed to connect to data base:", this.dataBaseServiceConfig.uri);

        this.dispatchMessage(DataBaseServiceMessageType.CONNECT_FAIL);
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    private static replaceKey(obj: any, key: string, to: string): void
    {
        if (obj[key] === undefined) return;

        Object.defineProperty(obj, to,
            Object.getOwnPropertyDescriptor(obj, key));

        delete obj[key];
    }
}