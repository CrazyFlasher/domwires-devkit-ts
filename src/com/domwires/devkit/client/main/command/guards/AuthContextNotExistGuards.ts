import {AbstractGuards, lazyInject} from "domwires";
import {Types} from "../../../../common/Types";
import {IClientAuthContext} from "../../../auth/context/IClientAuthContext";

export class AuthContextNotExistGuards extends AbstractGuards
{
    @lazyInject(Types.IClientAuthContext)
    private authContext!: IClientAuthContext;

    public override get allows(): boolean
    {
        try
        {
            this.authContext;
        } catch (e)
        {
            return true;
        }

        return false;
    }
}