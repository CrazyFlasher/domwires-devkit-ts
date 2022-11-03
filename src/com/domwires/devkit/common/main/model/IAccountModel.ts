import {setDefaultImplementation} from "domwires";
import {ISnapshotModel, ISnapshotModelImmutable, SnapshotModel} from "./ISnapshotModel";
import {Types} from "../../Types";
import {AccountDto} from "../../net/Dto";
import {snapshotValue} from "../../Decorators";

export interface IAccountModelImmutable extends ISnapshotModelImmutable<AccountDto>
{
    get email(): string;

    get password(): string;

    get nick(): string;

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
}

export class AccountModel extends SnapshotModel<AccountDto> implements IAccountModel
{
    @snapshotValue()
    private _nick!: string;

    @snapshotValue()
    private _email!: string;

    @snapshotValue()
    private _password!: string;

    private _isLoggedIn!: boolean;
    private _isGuest!: boolean;

    public get email(): string
    {
        return this._email;
    }

    public get password(): string
    {
        return this._password;
    }

    public get nick(): string
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
