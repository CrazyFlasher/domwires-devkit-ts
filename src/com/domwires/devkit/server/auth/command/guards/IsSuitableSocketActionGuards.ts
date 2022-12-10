import {AbstractAuthContextGuards} from "./AbstractAuthContextGuards";
import {SocketAction} from "../../../../common/net/SocketAction";
import {lazyInjectNamed} from "domwires";
import {Types} from "../../../../common/Types";

export class IsSuitableSocketActionGuards extends AbstractAuthContextGuards
{
    @lazyInjectNamed(Types.SocketAction, "requiredAction")
    private requiredAction!: SocketAction;

    @lazyInjectNamed(Types.string, "action")
    private requestAction!: string;

    public override get allows(): boolean
    {
        try
        {
            return this.requiredAction === SocketAction.get(this.requestAction);
        } catch (e)
        {
            return false;
        }
    }
}