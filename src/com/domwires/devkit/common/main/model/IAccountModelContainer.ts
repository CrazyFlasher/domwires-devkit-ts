import {
    HierarchyObjectContainer,
    IHierarchyObjectContainer,
    IHierarchyObjectContainerImmutable,
    MessageType,
    setDefaultImplementation
} from "domwires";
import {IAccountModel, IAccountModelImmutable} from "./IAccountModel";
import {Types} from "../../Types";

export class AccountModelContainerMessageType extends MessageType
{
    public static readonly ACCOUNT_JOINED: AccountModelContainerMessageType = new AccountModelContainerMessageType();
    public static readonly ACCOUNT_LEFT: AccountModelContainerMessageType = new AccountModelContainerMessageType();
}

export interface IAccountModelContainerImmutable extends IHierarchyObjectContainerImmutable<IAccountModelImmutable>
{
    get leftAccount(): IAccountModelImmutable;

    get joinedAccount(): IAccountModelImmutable;
}

export interface IAccountModelContainer extends IAccountModelContainerImmutable, IHierarchyObjectContainer<IAccountModel, IAccountModelImmutable>
{
}

export class AccountModelContainer extends
    HierarchyObjectContainer<IAccountModel, IAccountModelImmutable> implements IAccountModelContainer
{
    private _joinedAccount!: IAccountModel;
    private _leftAccount!: IAccountModel;

    public get joinedAccount(): IAccountModelImmutable
    {
        return this._joinedAccount;
    }

    public get leftAccount(): IAccountModelImmutable
    {
        return this._leftAccount;
    }

    public override add(child: IAccountModel, indexOrId?: number | string): boolean
    {
        const success = super.add(child, indexOrId);

        if (success)
        {
            this._joinedAccount = child;

            this.dispatchMessage(AccountModelContainerMessageType.ACCOUNT_JOINED);
        }

        return success;
    }

    public override remove(childOrId: string | IAccountModel, dispose?: boolean): boolean
    {
        const success = super.remove(childOrId, dispose);

        if (success)
        {
            const account = typeof childOrId === "string" ? this.get(childOrId) : childOrId;

            if (account)
            {
                this._leftAccount = account;

                this.dispatchMessage(AccountModelContainerMessageType.ACCOUNT_JOINED);
            }
        }

        return success;
    }
}

setDefaultImplementation<IAccountModelContainer>(Types.IAccountModelContainer, AccountModelContainer);