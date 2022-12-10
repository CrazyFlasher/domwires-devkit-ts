import {AbstractClientGuards} from "./AbstractClientGuards";
import {lazyInjectNamed} from "domwires";
import {SocketAction} from "../../../../common/net/SocketAction";
import {Types} from "../../../../common/Types";

export class IsSuitableActionGuards extends AbstractClientGuards
{
    @lazyInjectNamed(Types.SocketAction, "responseAction")
    private action!: SocketAction;

    public override get allows(): boolean
    {
        return this.action === SocketAction.get(this.netClient.getResponseData().action);
    }
}