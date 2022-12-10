import {AbstractAuthContextGuards} from "./AbstractAuthContextGuards";
import {lazyInjectNamed} from "domwires";
import {Types} from "../../../../common/Types";
import {HttpAction} from "../../../../common/net/HttpAction";

export class IsSuitableHttpActionGuards extends AbstractAuthContextGuards
{
    @lazyInjectNamed(Types.HttpAction, "requiredAction")
    private requiredAction!: HttpAction;

    @lazyInjectNamed(Types.string, "action")
    private requestAction!: string;

    public override get allows(): boolean
    {
        try
        {
            return this.requiredAction === HttpAction.get(this.requestAction);
        } catch (e)
        {
            return false;
        }
    }
}