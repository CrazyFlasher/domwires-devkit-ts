import {AbstractAuthCommand} from "../AbstractAuthCommand";
import {lazyInjectNamed} from "domwires";
import {Types} from "../../../../common/Types";
import {SocketAction} from "../../../../common/net/SocketAction";
import {ResultDto} from "../../../../common/net/Dto";
import {ErrorReason} from "../../../../common/ErrorReason";

export abstract class AbstractResponseCommand extends AbstractAuthCommand
{
    @lazyInjectNamed(Types.SocketAction, "responseAction")
    protected action!: SocketAction;

    @lazyInjectNamed(Types.boolean, "success")
    protected success!: boolean;

    public override execute(): void
    {
        super.execute();

        const response = this.netClient.getResponseData<{result: ResultDto}>().data;

        if (response.result.success)
        {
            this.handleSuccessResult();
        } else
        {
            this.handleFailResult(response.result.reason);
        }
    }

    protected handleSuccessResult(): void
    {
        this.logger.info(this.action.name + " success!");
    }

    protected handleFailResult(reason: string | ErrorReason | undefined): void
    {
        this.logger.warn(this.action.name + " fail!\nReason: " + reason);
    }
}