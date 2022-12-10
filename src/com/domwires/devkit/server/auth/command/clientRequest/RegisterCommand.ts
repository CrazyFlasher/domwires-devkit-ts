import {AccountDto} from "../../../../common/net/Dto";
import {AbstractClientRequestHandler} from "./AbstractClientRequestHandler";
import {Enum} from "domwires";
import {SocketAction} from "../../../../common/net/SocketAction";
import {Utils} from "../../../../common/utils/Utils";

export class RegisterCommand extends AbstractClientRequestHandler<AccountDto>
{
    protected override async process()
    {
        const result = await this.db.insertAccount(Utils.hashPassword(this.reqData!));
        const success = result.result != undefined;
        const reason = result.errorReason;

        this.socketResponse({
            success: success != undefined && success,
            reason
        });
    }

    protected override get cliReqAction(): Enum
    {
        return SocketAction.REGISTER;
    }
}