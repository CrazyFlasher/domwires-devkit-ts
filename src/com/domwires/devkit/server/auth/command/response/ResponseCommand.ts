import {AbstractAuthContextCommand} from "../AbstractAuthContextCommand";
import {lazyInjectNamed} from "domwires";
import {Types} from "../../../../common/Types";
import {ResultDto} from "../../../../common/net/dto/Dto";
import {SocketAction} from "../../../../common/net/SocketAction";

export class ResponseCommand extends AbstractAuthContextCommand
{
    @lazyInjectNamed(Types.boolean, "success")
    private success!: boolean;

    @lazyInjectNamed(Types.string, "reason")
    private reason!: string;

    @lazyInjectNamed(Types.SocketAction, "action")
    private action!: SocketAction;

    public override execute(): void
    {
        super.execute();

        let reason: string | undefined;

        try
        {
            reason = this.reason;
        } catch (e)
        {
        }

        this.socket.sendResponse<ResultDto>(this.queryRelatedToClientId, {
            action: this.getAction().name,
            data: {success: this.success, reason}
        });

    }

    protected getAction(): SocketAction
    {
        return this.action;
    }
}