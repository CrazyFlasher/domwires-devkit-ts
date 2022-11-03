import {lazyInjectNamed} from "domwires";
import {Types} from "../../../../common/Types";
import {ResultDto} from "../../../../common/net/Dto";
import {SocketAction} from "../../../../common/net/SocketAction";
import {AbstractAccountCommand} from "../account/AbstractAccountCommand";

export class ResponseCommand extends AbstractAccountCommand
{
    @lazyInjectNamed(Types.boolean, "success")
    private success!: boolean;

    @lazyInjectNamed(Types.string, "reason")
    private reason!: string;

    @lazyInjectNamed(Types.SocketAction, "action")
    private action!: SocketAction;

    @lazyInjectNamed(Types.string, "actionName")
    private actionName!: string;

    @lazyInjectNamed(Types.string, "queryId")
    private queryId!: string;

    public override execute(): void
    {
        super.execute();

        let queryId: string | undefined;

        try
        {
            queryId = this.queryId;
        } catch (e)
        {

        }

        let reason: string | undefined;

        try
        {
            reason = this.reason;
        } catch (e)
        {
        }

        let actionName: string;

        try
        {
            actionName = this.action.name;
        } catch (e)
        {
            actionName = this.actionName;
        }

        this.socket.sendResponse<ResultDto>(
            queryId != undefined ? this.queryRelatedToClientId : this.clientId, {
            action: actionName,
            data: {success: this.success, reason}
        });
    }
}