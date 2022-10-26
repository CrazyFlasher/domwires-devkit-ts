import {SocketAction} from "../../../../../common/net/SocketAction";
import {AbstractAuthContextGuards} from "../AbstractAuthContextGuards";

export class IsRegisterQueryGuards extends AbstractAuthContextGuards
{
    public override get allows(): boolean
    {
        return this.query != undefined && this.query.id === SocketAction.REGISTER;
    }
}