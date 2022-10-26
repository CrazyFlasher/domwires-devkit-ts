import {SocketAction} from "../../../../../common/net/SocketAction";
import {AbstractAuthContextGuards} from "../AbstractAuthContextGuards";

export class IsLoginActionGuards extends AbstractAuthContextGuards
{
    public override get allows(): boolean
    {
        return this.action === SocketAction.LOGIN;
    }
}