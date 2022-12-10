import {setDefaultImplementation} from "domwires";
import {ISnapshotModel, ISnapshotModelImmutable, SnapshotModel} from "./ISnapshotModel";
import {Types} from "../../Types";
import {AccountDto} from "../../net/Dto";
import {snapshotValue} from "../../Decorators";
import {ObjectId} from "bson";

export interface IAccountModelImmutable extends ISnapshotModelImmutable<AccountDto>
{
    get id(): ObjectId | undefined;

    get email(): string | undefined;

    get password(): string | undefined;

    get nick(): string | undefined;

    get isLoggedIn(): boolean;

    get isGuest(): boolean;
}

export interface IAccountModel extends ISnapshotModel<AccountDto>, IAccountModelImmutable
{
    setNick(value: string): IAccountModel;

    setEmail(value: string): IAccountModel;

    setPassword(value: string): IAccountModel;

    setIsLoggedIn(value: boolean): IAccountModel;

    setIsGuest(value: boolean): IAccountModel;

    setId(value: ObjectId): IAccountModel;
}

export class AccountModel extends SnapshotModel<AccountDto> implements IAccountModel
{
    @snapshotValue()
    private _nick!: string | undefined;

    @snapshotValue()
    private _email!: string | undefined;

    private _password!: string | undefined;

    private _isLoggedIn!: boolean;
    private _isGuest!: boolean;
    private _id!: ObjectId | undefined;

    public get id(): ObjectId | undefined
    {
        return this._id;
    }

    public get email(): string | undefined
    {
        return this._email;
    }

    public get password(): string | undefined
    {
        return this._password;
    }

    public get nick(): string | undefined
    {
        return this._nick;
    }

    public get isGuest(): boolean
    {
        return this._isGuest;
    }

    public get isLoggedIn(): boolean
    {
        return this._isLoggedIn;
    }

    public setId(value: ObjectId): IAccountModel
    {
        this._id = value;

        return this;
    }

    public setEmail(value: string): IAccountModel
    {
        this._email = value;

        return this;
    }

    public setNick(value: string): IAccountModel
    {
        this._nick = value;

        return this;
    }

    public setPassword(value: string): IAccountModel
    {
        this._password = value;

        return this;
    }

    public setIsGuest(value: boolean): IAccountModel
    {
        this._isGuest = value;

        return this;
    }

    public setIsLoggedIn(value: boolean): IAccountModel
    {
        this._isLoggedIn = value;

        return this;
    }
}

setDefaultImplementation<IAccountModel>(Types.IAccountModel, AccountModel);
