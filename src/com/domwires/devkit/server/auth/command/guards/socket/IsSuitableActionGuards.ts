import {AbstractAuthContextGuards} from "../AbstractAuthContextGuards";
import {SocketAction} from "../../../../../common/net/SocketAction";
import {lazyInjectNamed} from "domwires";
import {Types} from "../../../../../common/Types";

export class IsSuitableActionGuards extends AbstractAuthContextGuards
{
    @lazyInjectNamed(Types.SocketAction, "action")
    private action!: SocketAction;

    public override get allows(): boolean
    {
        return this.action === SocketAction.get(this.socket.getRequestData().action);
    }
}