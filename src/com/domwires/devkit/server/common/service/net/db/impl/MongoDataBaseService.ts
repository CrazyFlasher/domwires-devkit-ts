/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    DataBaseServiceConfig,
    DataBaseServiceMessageType,
    IDataBaseService,
    Query,
    UpdateOperator
} from "../IDataBaseService";
import {inject} from "inversify";
import {Db, Filter, FindCursor, FindOptions, MongoClient} from "mongodb";
import {Types} from "../../../../../../common/Types";
import {AbstractNetServerService} from "../../AbstractNetServerService";
import {INetServerService} from "../../INetServerService";

// TODO: make final
export class MongoDataBaseService extends AbstractNetServerService implements IDataBaseService
{
    @inject(Types.ServiceConfig)
    protected dataBaseServiceConfig!: DataBaseServiceConfig;

    private client!: MongoClient;
    private db!: Db;

    private _findResult!: any | undefined;
    private _deleteResult!: number;
    private _query!: Query | undefined;

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

    protected override get serverName(): string
    {
        return "mongodb://" + super.serverName;
    }

    protected override async createServer()
    {
        this.client = new MongoClient(this.serverName);

        try
        {
            await this.client.connect();

            this.db = this.client.db(this.dataBaseServiceConfig.dataBaseName);

            this.openSuccess();
        } catch (e)
        {
            this.openFail(e);
        }
    }

    protected override openSuccess(): void
    {
        this.initSuccess();

        super.openSuccess();
    }

    public override close(): INetServerService
    {
        if (this._isOpened)
        {
            this.client.close(error =>
            {
                if (error)
                {
                    this.closeFail(error);
                }
                else
                {
                    this.closeSuccess();
                }
            });
        }

        return this;
    }

    public async createCollection(list: { name: string; uniqueIndexList?: string[] }[])
    {
        if (!this.checkIsOpened()) return;

        for await (const data of list)
        {
            try
            {
                const resultCollection = await this.db.collection(data.name);

                if (data.uniqueIndexList && data.uniqueIndexList.length > 0)
                {
                    await resultCollection.createIndex(data.uniqueIndexList, {unique: true});

                    this.createTableSuccess();
                }
                else
                {
                    this.createTableSuccess();
                }
            } catch (e)
            {
                this.warn("Cannot create collection:", data.name, data.uniqueIndexList, e);

                this.dispatchMessage(DataBaseServiceMessageType.CREATE_COLLECTION_FAIL);
            }
        }

        this.dispatchMessage(DataBaseServiceMessageType.CREATE_COLLECTION_LIST_COMPLETE);
    }

    private createTableSuccess(): void
    {
        this.dispatchMessage(DataBaseServiceMessageType.CREATE_COLLECTION_SUCCESS);
    }

    public async dropCollection(name: string)
    {
        if (!this.checkIsOpened()) return;

        try
        {
            await this.db.dropCollection(name);

            this.dispatchMessage(DataBaseServiceMessageType.DROP_COLLECTION_SUCCESS);
        } catch (e)
        {
            this.error("Cannot drop collection:", name, e);

            this.dispatchMessage(DataBaseServiceMessageType.DROP_COLLECTION_FAIL);
        }
    }

    public async insert<T>(query: Query, collectionName: string, itemList: ReadonlyArray<T>)
    {
        if (!this.checkIsOpened()) return;

        this._query = undefined;

        try
        {
            await this.db.collection<T>(collectionName).insertMany(itemList as []);

            this.dispatch(DataBaseServiceMessageType.INSERT_SUCCESS, query);
        } catch (e)
        {
            this.warn("Cannot insert:", collectionName, JSON.stringify(itemList), e);

            this.dispatch(DataBaseServiceMessageType.INSERT_FAIL, query);
        }
    }

    public getFindResult<T>(): T
    {
        return this._findResult;
    }

    public async find<T>(query: Query, collectionName: string, filter: T, limit?: number, sort?: { field: string; ascending?: boolean })
    {
        if (!this.checkIsOpened()) return;

        this._query = undefined;
        this._findResult = undefined;

        try
        {
            let opts: FindOptions | undefined = undefined;
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

            const collection = this.db.collection<T>(collectionName);
            const cursor: FindCursor = await collection
                .find<T>(this.toMongoOperators(filter, this.filterOperatorMap), opts);

            const result = await cursor.toArray();

            if (result.length === 0)
            {
                this.warn("Nothing found:", collectionName, filter);

                this.dispatch(DataBaseServiceMessageType.FIND_FAIL, query);
            }
            else
            {
                this._findResult = result;

                this.dispatch(DataBaseServiceMessageType.FIND_SUCCESS, query);
            }
        } catch (e)
        {
            this.warn("Cannot find:", collectionName, filter, e);

            this.dispatch(DataBaseServiceMessageType.FIND_FAIL, query);
        }
    }

    private dispatch(messageType: DataBaseServiceMessageType, query: Query): void
    {
        this._query = query;

        this.dispatchMessage(messageType, query);
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
            const pd: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(filter, key);

            if (pd)
            {
                Object.defineProperty(out, key, pd);
            }

            operatorMap.forEach((v, k) =>
            {
                MongoDataBaseService.replaceKey(out, k, v);
            });
        }

        return out;
    }

    public async update<T>(collectionName: string, filter: T, updateFilter: UpdateOperator<T>)
    {
        if (!this.checkIsOpened()) return;

        try
        {
            await this.db.collection<T>(collectionName)
                .updateMany(this.toMongoOperators(filter, this.filterOperatorMap),
                    this.toMongoUpdateOperators(updateFilter, this.updateOperatorMap));

            this.dispatchMessage(DataBaseServiceMessageType.UPDATE_SUCCESS);
        } catch (e)
        {
            this.warn("Cannot update:", collectionName, filter, updateFilter, e);

            this.dispatchMessage(DataBaseServiceMessageType.UPDATE_FAIL);
        }
    }

    public get deleteResult(): number
    {
        return this._deleteResult;
    }

    public get query(): Query | undefined
    {
        return this._query;
    }

    public async delete<T>(collectionName: string, filter: T)
    {
        if (!this.checkIsOpened()) return;

        this._deleteResult = 0;

        try
        {
            const result = await this.db.collection<T>(collectionName).deleteMany(this.toMongoOperators(filter, this.filterOperatorMap));

            this._deleteResult = result.deletedCount;

            this.dispatchMessage(DataBaseServiceMessageType.DELETE_SUCCESS);
        } catch (e)
        {
            this.warn("Cannot delete:", collectionName, filter, e);

            this.dispatchMessage(DataBaseServiceMessageType.DELETE_FAIL);
        }
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    private static replaceKey(obj: any, key: string, to: string): void
    {
        if (obj[key] === undefined) return;

        const pd: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(obj, key);

        if (pd)
        {
            Object.defineProperty(obj, to, pd);
        }

        delete obj[key];
    }
}