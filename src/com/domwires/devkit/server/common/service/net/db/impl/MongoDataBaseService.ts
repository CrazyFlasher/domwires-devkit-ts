import {
    DataBaseErrorReason,
    DataBaseServiceConfig,
    DataBaseServiceMessageType,
    IDataBaseService,
    Query,
    UpdateOperator
} from "../IDataBaseService";
import {inject} from "inversify";
import {
    Db,
    DeleteResult,
    Document,
    Filter,
    FindCursor,
    FindOptions,
    MongoClient,
    MongoServerError,
    OptionalUnlessRequiredId,
    UpdateResult
} from "mongodb";
import {Types} from "../../../../../../common/Types";
import {AbstractNetServerService} from "../../AbstractNetServerService";
import {INetServerService} from "../../INetServerService";
import {ObjectId} from "bson";

export class MongoDataBaseService extends AbstractNetServerService implements IDataBaseService
{
    @inject(Types.ServiceConfig)
    protected dataBaseServiceConfig!: DataBaseServiceConfig;

    private client!: MongoClient;
    private db!: Db;

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

    public async createCollection(list: { name: string; uniqueIndexList?: string[]; mandatoryFields?: string[] }[])
        : Promise<{ result?: boolean; errorReason?: DataBaseErrorReason }>
    {
        if (!this.checkIsOpened()) return {errorReason: DataBaseErrorReason.DATABASE_SERVICE_CLOSED};

        for await (const data of list)
        {
            try
            {
                const resultCollection = await this.db.createCollection(data.name, data.mandatoryFields ? {
                    validator: {
                        $jsonSchema: {
                            required: data.mandatoryFields,
                            properties: {
                                email: {
                                    pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"
                                }
                            }
                        }
                    }
                } : undefined);

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

                return {errorReason: DataBaseErrorReason.CREATE_COLLECTION_FAILED};
            }
        }

        this.dispatchMessage(DataBaseServiceMessageType.CREATE_COLLECTION_LIST_COMPLETE);

        return {result: true};
    }

    private createTableSuccess(): void
    {
        this.dispatchMessage(DataBaseServiceMessageType.CREATE_COLLECTION_SUCCESS);
    }

    public async dropCollection(name: string): Promise<{ result?: boolean; errorReason?: DataBaseErrorReason }>
    {
        if (!this.checkIsOpened()) return {errorReason: DataBaseErrorReason.DATABASE_SERVICE_CLOSED};

        try
        {
            await this.db.dropCollection(name);

            this.dropCollectionResult(true);

            return {result: true};
        } catch (e)
        {
            this.warn("Cannot drop collection:", name, e);

            this.dropCollectionResult(false);
        }

        return {errorReason: DataBaseErrorReason.DROP_COLLECTION_FAILED};
    }

    protected dropCollectionResult(success: boolean): void
    {
        this.dispatchMessage(success ? DataBaseServiceMessageType.DROP_COLLECTION_SUCCESS :
            DataBaseServiceMessageType.DROP_COLLECTION_FAIL);
    }

    public async insert<TEntity, TData = void>(collectionName: string, itemList: TEntity[], query?: Query<TData>):
        Promise<{ query?: Query<TData>; result?: ObjectId[] | ObjectId; errorReason?: DataBaseErrorReason }>
    {
        if (!this.checkIsOpened()) return {errorReason: DataBaseErrorReason.DATABASE_SERVICE_CLOSED};

        try
        {
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            let insertResult: any | undefined;

            if (itemList.length > 1)
            {
                /* eslint-disable-next-line no-type-assertion/no-type-assertion */
                const insertManyResult = await this.db.collection<TEntity>(collectionName).insertMany(itemList as []);

                insertResult = insertManyResult.insertedIds;
            }
            else if (itemList.length == 1)
            {
                /* eslint-disable-next-line no-type-assertion/no-type-assertion */
                const insertOneResult = await this.db.collection<TEntity>(collectionName).insertOne(itemList[0] as OptionalUnlessRequiredId<TEntity>);

                insertResult = insertOneResult.insertedId;
            }

            this.dispatch(DataBaseServiceMessageType.INSERT_SUCCESS, query, insertResult);

            return {query, result: insertResult};
        } catch (e)
        {
            this.warn("Cannot insert:", collectionName, JSON.stringify(itemList), e);

            /* eslint-disable-next-line no-type-assertion/no-type-assertion */
            const mongoError: MongoServerError = e as MongoServerError;

            let errorReason: DataBaseErrorReason | undefined;

            if (mongoError.code === 121)
            {
                errorReason = DataBaseErrorReason.VALIDATION_FAILED;
            }
            else if (mongoError.code === 11000)
            {
                errorReason = DataBaseErrorReason.DUPLICATE;
            }

            this.dispatch(DataBaseServiceMessageType.INSERT_FAIL, query, undefined, errorReason);

            return {query, errorReason};
        }
    }

    public async find<TFilter, TEntity extends TFilter = TFilter, TData = void, P = void>
    (collectionName: string, filter: TFilter, projection?: P, query?: Query<TData>, limit?: number, sort?: { field: string; ascending?: boolean }):
        Promise<{ query?: Query<TData>; result?: TEntity[]; errorReason?: DataBaseErrorReason }>
    {
        if (!this.checkIsOpened()) return {errorReason: DataBaseErrorReason.DATABASE_SERVICE_CLOSED};

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

            const collection = this.db.collection<TFilter>(collectionName);

            let cursor: FindCursor;

            if (!projection)
            {
                cursor = await collection
                    .find<TEntity>(this.toMongoOperators(filter, this.filterOperatorMap), opts);
            }
            else
            {
                cursor = await collection
                    .find<TEntity>(this.toMongoOperators(filter, this.filterOperatorMap), opts).project(projection);
            }

            const result = await cursor.toArray();

            if (result.length === 0)
            {
                this.warn("Nothing found:", collectionName, filter);

                this.dispatch(DataBaseServiceMessageType.FIND_FAIL, query, undefined, DataBaseErrorReason.NOT_FOUND);

                return {query, errorReason: DataBaseErrorReason.NOT_FOUND};
            }
            else
            {
                this.dispatch(DataBaseServiceMessageType.FIND_SUCCESS, query, result);

                return {query, result};
            }
        } catch (e)
        {
            this.warn("Cannot find:", collectionName, filter, e);

            this.dispatch(DataBaseServiceMessageType.FIND_FAIL, query);

            return {query, errorReason: DataBaseErrorReason.NOT_FOUND};
        }
    }

    protected dispatch<TResult, TData>(messageType: DataBaseServiceMessageType, query?: Query<TData>, result?: TResult,
                                       errorReason?: DataBaseErrorReason): void
    {
        this.dispatchMessage(messageType, {query, result, errorReason});
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

    public async update<TFilter, TEntity extends TFilter = TFilter, TUFilter = TEntity, TData = void>
    (collectionName: string, filter: TFilter, updateFilter: UpdateOperator<TUFilter>, query?: Query<TData>, many = false):
        Promise<{ query?: Query<TData>; result?: boolean; errorReason?: DataBaseErrorReason }>
    {
        if (!this.checkIsOpened()) return {errorReason: DataBaseErrorReason.DATABASE_SERVICE_CLOSED};

        try
        {
            let result: UpdateResult | Document;

            if (many)
            {
                result = await this.db.collection<TFilter>(collectionName)
                    .updateMany(this.toMongoOperators(filter, this.filterOperatorMap),
                        this.toMongoUpdateOperators(updateFilter, this.updateOperatorMap));
            }
            else
            {
                result = await this.db.collection<TFilter>(collectionName)
                    .updateOne(this.toMongoOperators(filter, this.filterOperatorMap),
                        this.toMongoUpdateOperators(updateFilter, this.updateOperatorMap));
            }

            this.dispatch(DataBaseServiceMessageType.UPDATE_SUCCESS, query, result.upsertedId);

            return {query, result: result.acknowledged};
        } catch (e)
        {
            this.warn("Cannot update:", collectionName, filter, updateFilter, e);

            this.dispatch(DataBaseServiceMessageType.UPDATE_FAIL, query, undefined, DataBaseErrorReason.UPDATE_FAILED);

            return {query, errorReason: DataBaseErrorReason.UPDATE_FAILED};
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    public async delete<TFilter, TEntity extends TFilter = TFilter, TData = void>(collectionName: string, filter: TFilter, query?: Query<TData>, many = false):
        Promise<{ query?: Query<TData>; result?: number; errorReason?: DataBaseErrorReason }>
    {
        if (!this.checkIsOpened()) return {errorReason: DataBaseErrorReason.DATABASE_SERVICE_CLOSED};

        try
        {
            let result: DeleteResult;

            if (many)
            {
                result = await this.db.collection<TFilter>(collectionName).deleteMany(this.toMongoOperators(filter, this.filterOperatorMap));
            }
            else
            {
                result = await this.db.collection<TFilter>(collectionName).deleteOne(this.toMongoOperators(filter, this.filterOperatorMap));
            }

            this.dispatch(DataBaseServiceMessageType.DELETE_SUCCESS, query, result.deletedCount);

            return {query, result: result.deletedCount};
        } catch (e)
        {
            this.warn("Cannot delete:", collectionName, filter, e);

            this.dispatch(DataBaseServiceMessageType.DELETE_FAIL, query, undefined, DataBaseErrorReason.DELETE_FAILED);

            return {query, errorReason: DataBaseErrorReason.DELETE_FAILED};
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
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