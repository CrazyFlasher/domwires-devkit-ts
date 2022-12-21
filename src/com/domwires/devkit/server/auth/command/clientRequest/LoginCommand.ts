import {AccountDto} from "../../../../common/net/Dto";
import {ErrorReason} from "../../../../common/ErrorReason";
import {AbstractClientRequestHandler} from "./AbstractClientRequestHandler";
import {Enum} from "domwires";
import {SocketAction} from "../../../../common/net/SocketAction";
import {ServerUtils} from "../../../utils/ServerUtils";

export class LoginCommand extends AbstractClientRequestHandler<AccountDto>
{
    protected override async process()
    {
        if (this.account)
        {
            this.account.setPassword(ServerUtils.hashPassword(this.reqData!.password!));

            const result = await this.db.findAccount(this.reqData!.email);

            const foundAccount = result.result && result.result[0];
            const success = foundAccount && foundAccount.password === this.account.password;
            const reason = !success && foundAccount ? ErrorReason.WRONG_PASSWORD : result && result.errorReason;

            if (foundAccount)
            {
                this.account.setId(foundAccount._id!).setIsLoggedIn(true).setIsGuest(false)
                    .setSnapshot(foundAccount);
            }

            this.socketResponse<AccountDto>({
                success: success != undefined && success,
                reason,
                data: success ? foundAccount : undefined});
        }

        this.resolve();
    }

    protected override get cliReqAction(): Enum
    {
        return SocketAction.LOGIN;
    }
}