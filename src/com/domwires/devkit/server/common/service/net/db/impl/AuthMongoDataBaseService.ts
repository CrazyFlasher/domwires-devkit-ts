import {MongoDataBaseService} from "./MongoDataBaseService";
import {AuthDataBaseServiceMessageType, IAuthDataBaseService} from "../IAuthDataBaseService";
import {ObjectId} from "bson";
import {Enum} from "domwires";
import {AccountDto, TokenDto} from "../../../../../../common/net/Dto";
import {Collection} from "../../../../Collection";
import {DataBaseErrorReason, Query} from "../IDataBaseService";

class Collections extends Enum
{
    public static readonly ACCOUNTS: Collections = new Collections("ACCOUNTS");
    public static readonly TOKENS: Collections = new Collections("TOKENS");
}

export class AuthMongoDataBaseService extends MongoDataBaseService implements IAuthDataBaseService
{
    public async createCollections()
    {
        try
        {
            await this.createCollection([
                {
                    name: Collections.ACCOUNTS.name,
                    uniqueIndexList: ["email"], mandatoryFields: ["email", "password", "nick"]
                },
                {
                    name: Collections.TOKENS.name,
                    uniqueIndexList: undefined, mandatoryFields: ["userId", "type", "expireDt"]
                }
            ]);

            this.dispatchMessage(AuthDataBaseServiceMessageType.COLLECTIONS_CREATE_SUCCESS);
        } catch (e)
        {
            this.dispatchMessage(AuthDataBaseServiceMessageType.COLLECTIONS_CREATE_FAIL);
        }
    }

    public async dropCollections()
    {
        try
        {
            await this.dropCollection(Collections.ACCOUNTS.name);
            await this.dropCollection(Collections.TOKENS.name);

            this.dispatchMessage(AuthDataBaseServiceMessageType.COLLECTIONS_DROP_SUCCESS);
        } catch (e)
        {
            this.dispatchMessage(AuthDataBaseServiceMessageType.COLLECTIONS_DROP_FAIL);
        }
    }

    public async findAccount<TProj = void, TData = void>(emailOrId: string | ObjectId, projection?: TProj, query?: Query<TData>):
        Promise<{ query?: Query<TData>; result?: AccountDto[]; errorReason?: DataBaseErrorReason }>
    {
        type Filter = { email?: string; _id?: ObjectId };

        let filter: Filter;

        if (typeof emailOrId === "string")
        {
            filter = {email: emailOrId};
        }
        else
        {
            filter = {_id: emailOrId};
        }

        return await this.find<Filter, AccountDto, TData, TProj>(Collections.ACCOUNTS.name, filter, projection, query);
    }

    public async insertAccount<TData = void>(value: AccountDto, query?: Query<TData>):
        Promise<{ query?: Query<TData>; result?: ObjectId[] | ObjectId; errorReason?: DataBaseErrorReason }>
    {
        return await this.insert<AccountDto, TData>(Collection.ACCOUNTS.name, [value], query);
    }

    public async insertToken<TData = void>(value: TokenDto, query?: Query<TData>):
        Promise<{ query?: Query<TData>; result?: ObjectId[] | ObjectId; errorReason?: DataBaseErrorReason }>
    {
        return await this.insert<TokenDto, TData>(Collection.TOKENS.name, [value], query);
    }

    public async findToken<TProj = void, TData = void>(id: ObjectId, projection?: TProj, query?: Query<TData>):
        Promise<{ query?: Query<TData>; result?: TokenDto[]; errorReason?: DataBaseErrorReason }>
    {
        return await this.find<{ _id?: ObjectId }, TokenDto, TData, TProj>(Collection.TOKENS.name, {_id: id}, projection, query);
    }

    public async updateAccountPassword<TData = void>(id: ObjectId, password: string, query?: Query<TData>):
        Promise<{ query?: Query<TData>; result?: boolean; errorReason?: DataBaseErrorReason }>
    {
        return await this.update<{ _id?: ObjectId }, AccountDto, { password: string }, TData>(
            Collection.ACCOUNTS.name, {_id: id}, {$set: {password}}, query);
    }

    public async updateAccountEmail<TData = void>(id: ObjectId, email: string, query?: Query<TData>):
        Promise<{ query?: Query<TData>; result?: boolean; errorReason?: DataBaseErrorReason }>
    {
        return await this.update<{ _id?: ObjectId }, AccountDto, { email: string }, TData>(
            Collection.ACCOUNTS.name, {_id: id}, {$set: {email}}, query);
    }

    public async updateAccountData<TData = void>(value: AccountDto, query?: Query<TData>):
        Promise<{ query?: Query<TData>; result?: boolean; errorReason?: DataBaseErrorReason }>
    {
        return await this.update(Collection.ACCOUNTS.name, {_id: value._id}, {$set: {nick: value.nick}}, query);
    }

    public async deleteToken<TData = void>(id: ObjectId, query?: Query<TData>):
        Promise<{ query?: Query<TData>; result?: number; errorReason?: DataBaseErrorReason }>
    {
        return await this.delete<{ _id?: ObjectId }, TokenDto, TData>(Collection.TOKENS.name, {_id: id}, query);
    }

    public async deleteAccount<TData = void>(id: ObjectId, query?: Query<TData>):
        Promise<{ query?: Query<TData>; result?: number; errorReason?: DataBaseErrorReason }>
    {
        return await this.delete<{ _id?: ObjectId }, AccountDto, TData>(Collection.ACCOUNTS.name, {_id: id}, query);
    }
}