import {AbstractAuthContextCommand} from "../AbstractAuthContextCommand";
import {lazyInjectNamed} from "domwires";
import {Types} from "../../../../common/Types";
import {ResultDto} from "../../../../common/net/dto/Dto";
import {SocketAction} from "../../../../common/net/SocketAction";
import {Result} from "../../../../common/net/Result";

export class SocketResponseCommand extends AbstractAuthContextCommand
{
    @lazyInjectNamed(Types.boolean, "success")
    private success!: boolean;

    @lazyInjectNamed(Types.SocketAction, "action")
    private action!: SocketAction;

    public override execute(): void
    {
        super.execute();

        const clientId = this.db.query && this.db.query.relatedToClientId;

        if (!clientId)
        {
            throw new Error("'clientId' not defined");
        }

        this.socket.sendResponse<ResultDto>(clientId, {
            action: this.getAction().name,
            data: {result: (this.success ? Result.SUCCESS : Result.FAIL).name}
        });

    }

    protected getAction(): SocketAction
    {
        return this.action;
    }
}