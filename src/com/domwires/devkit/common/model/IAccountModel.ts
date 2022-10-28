import {setDefaultImplementation} from "domwires";
import {SnapshotModel, ISnapshotModel, ISnapshotModelImmutable} from "./ISnapshotModel";
import {Types} from "../Types";
import {AccountDto} from "../net/dto/Dto";
import {snapshotValue} from "../Decorators";

export interface IAccountModelImmutable extends ISnapshotModelImmutable<AccountDto>
{
    get email(): string;

    get password(): string;

    get nick(): string;
}

export interface IAccountModel extends ISnapshotModel<AccountDto>, IAccountModelImmutable
{
    setNick(value: string): IAccountModel;

    setEmail(value: string): IAccountModel;

    setPassword(value: string): IAccountModel;
}

export class AccountModel extends SnapshotModel<AccountDto> implements IAccountModel
{
    @snapshotValue()
    private _nick!: string;

    @snapshotValue()
    private _email!: string;

    @snapshotValue()
    private _password!: string;

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
