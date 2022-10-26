import {IModel, setDefaultImplementation} from "domwires";
import {AbstractSnapshotModel, ISnapshotModel, ISnapshotModelImmutable} from "./ISnapshotModel";
import {Types} from "../Types";

export type AccountModelSnapshot = {
    readonly nick: string;
    readonly email: string;
    readonly password: string;
};

export interface IAccountModelImmutable extends ISnapshotModelImmutable<AccountModelSnapshot>
{
    get email(): string;

    get password(): string;

    get nick(): string;
}

export interface IAccountModel extends IAccountModelImmutable, IModel
{
    setNick(value: string): IAccountModel;

    setEmail(value: string): IAccountModel;

    setPassword(value: string): IAccountModel;
}

export class AccountModel extends AbstractSnapshotModel<AccountModelSnapshot> implements IAccountModel
{
    private _nick!: string;
    private _email!: string;
    private _password!: string;

    public override setSnapshot(value: AccountModelSnapshot): ISnapshotModel<AccountModelSnapshot>
    {
        this._nick = value.nick;
        this._email = value.email;
        this._password = value.password;

        return this;
    }

    public override get snapshot(): AccountModelSnapshot
    {
        return {
            nick: this._nick,
            email: this._email,
            password: this._password
        };
    }

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
}

setDefaultImplementation<IAccountModel>(Types.IAccountModel, AccountModel);
