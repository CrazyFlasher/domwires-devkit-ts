import {DataBaseErrorReason, IDataBaseService, IDataBaseServiceImmutable, Query} from "./IDataBaseService";
import {ObjectId} from "bson";
import {MessageType} from "domwires";
import {AccountDto, TokenDto} from "../../../../../common/net/Dto";

export class AuthDataBaseServiceMessageType extends MessageType
{
    public static readonly COLLECTIONS_CREATE_SUCCESS: AuthDataBaseServiceMessageType = new AuthDataBaseServiceMessageType();
    public static readonly COLLECTIONS_CREATE_FAIL: AuthDataBaseServiceMessageType = new AuthDataBaseServiceMessageType();
    public static readonly COLLECTIONS_DROP_SUCCESS: AuthDataBaseServiceMessageType = new AuthDataBaseServiceMessageType();
    public static readonly COLLECTIONS_DROP_FAIL: AuthDataBaseServiceMessageType = new AuthDataBaseServiceMessageType();
}

export interface IAuthDataBaseServiceImmutable extends IDataBaseServiceImmutable
{
    findAccount<TProj = void, TData = void>(email: string, projection?: TProj, query?: Query<TData>):
        Promise<{ query?: Query<TData>; result?: AccountDto[]; errorReason?: DataBaseErrorReason }>;

    findAccount<TProj = void, TData = void>(id: ObjectId, projection?: TProj, query?: Query<TData>):
        Promise<{ query?: Query<TData>; result?: AccountDto[]; errorReason?: DataBaseErrorReason }>;

    findToken<TProj = void, TData = void>(id: ObjectId, projection?: TProj, query?: Query<TData>):
        Promise<{ query?: Query<TData>; result?: TokenDto[]; errorReason?: DataBaseErrorReason }>;
}

export interface IAuthDataBaseService extends IAuthDataBaseServiceImmutable, IDataBaseService
{
    createCollections(): void;

    dropCollections(): void;

    insertAccount<TData = void>(value: AccountDto, query?: Query<TData>):
        Promise<{ query?: Query<TData>; result?: ObjectId[] | ObjectId; errorReason?: DataBaseErrorReason }>;

    insertToken<TData = void>(value: TokenDto, query?: Query<TData>):
        Promise<{ query?: Query<TData>; result?: ObjectId[] | ObjectId; errorReason?: DataBaseErrorReason }>;

    updateAccountPassword<TData = void>(id: ObjectId, password: string, query?: Query<TData>):
        Promise<{ query?: Query<TData>; result?: boolean; errorReason?: DataBaseErrorReason }>;

    updateAccountEmail<TData = void>(id: ObjectId, email: string, query?: Query<TData>):
        Promise<{ query?: Query<TData>; result?: boolean; errorReason?: DataBaseErrorReason }>;

    deleteToken<TData = void>(id: ObjectId, query?: Query<TData>):
        Promise<{ query?: Query<TData>; result?: number; errorReason?: DataBaseErrorReason }>;

    deleteAccount<TData = void>(id: ObjectId, query?: Query<TData>):
        Promise<{ query?: Query<TData>; result?: number; errorReason?: DataBaseErrorReason }>;

    updateAccountData<TData = void>(value: AccountDto, query?: Query<TData>):
        Promise<{ query?: Query<TData>; result?: boolean; errorReason?: DataBaseErrorReason }>;
}