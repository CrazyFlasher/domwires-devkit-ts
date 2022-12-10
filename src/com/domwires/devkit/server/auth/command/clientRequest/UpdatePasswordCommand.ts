import {Utils} from "../../../../common/utils/Utils";
import {ErrorReason} from "../../../../common/ErrorReason";
import {AbstractClientRequestHandler} from "./AbstractClientRequestHandler";
import {Enum} from "domwires";

export class UpdatePasswordCommand extends AbstractClientRequestHandler<{ oldPassword: string; newPassword: string }>
{
    protected override async process()
    {
        let success = false;
        let reason: Enum | undefined;

        if (this.account && this.account.isLoggedIn && !this.account.isGuest)
        {
            if (Utils.hashPassword(this.reqData!.oldPassword) != this.account.password)
            {
                reason = ErrorReason.OLD_PASSWORD_NO_MATCH;
            } else
            {
                const newHashedPassword = Utils.hashPassword(this.reqData!.newPassword);
                const updateResult = await this.db.updateAccountPassword(this.account.id!, newHashedPassword);

                if (updateResult.result)
                {
                    this.account.setPassword(newHashedPassword);

                    const text = "Password updated! New password: " + this.reqData!.newPassword;

                    this.email.send("", this.account.email!, "New password is set", text, text);

                    success = true;
                } else
                if (updateResult.errorReason)
                {
                    reason = updateResult.errorReason;
                }
            }
        } else
        {
            reason = ErrorReason.UNAUTHORIZED;
        }

        this.socketResponse({success, reason});

        this.resolve();
    }
}