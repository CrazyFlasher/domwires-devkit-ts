import {SocketAction} from "../../../../../common/net/SocketAction";
import {AbstractAuthContextGuards} from "../AbstractAuthContextGuards";

export class IsLoginQueryGuards extends AbstractAuthContextGuards
{
    public override get allows(): boolean
    {
        return this.query != undefined && this.query.id === SocketAction.LOGIN;
    }
}