import {AccountDto} from "../../../../common/net/Dto";
import {AbstractClientRequestHandler} from "./AbstractClientRequestHandler";
import {Enum} from "domwires";
import {ErrorReason} from "../../../../common/ErrorReason";

export class UpdateAccountDataCommand extends AbstractClientRequestHandler<AccountDto>
{
    protected override async process()
    {
        let success = false;
        let reason: Enum | undefined;

        if (this.account && this.account.isLoggedIn && !this.account.isGuest)
        {
            this.account.setNick(this.reqData!.nick);

            const updateResult = await this.db.updateAccountData(this.reqData!);

            if (updateResult.result)
            {
                success = true;
            }
            else if (updateResult.errorReason)
            {
                reason = updateResult.errorReason;
            }
        } else
        {
            reason = ErrorReason.UNAUTHORIZED;
        }

        this.socketResponse({success, reason});

        this.resolve();
    }
}