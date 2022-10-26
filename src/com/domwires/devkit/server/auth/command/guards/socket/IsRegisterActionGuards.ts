import {SocketAction} from "../../../../../common/net/SocketAction";
import {AbstractAuthContextGuards} from "../AbstractAuthContextGuards";

export class IsRegisterActionGuards extends AbstractAuthContextGuards
{
    public override get allows(): boolean
    {
        return this.action === SocketAction.REGISTER;
    }
}