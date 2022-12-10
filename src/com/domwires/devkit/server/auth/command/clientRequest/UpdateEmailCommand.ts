import {ErrorReason} from "../../../../common/ErrorReason";
import {AbstractClientRequestHandler} from "./AbstractClientRequestHandler";
import {Enum} from "domwires";

export class UpdateEmailCommand extends AbstractClientRequestHandler<{ email: string }>
{
    protected override async process()
    {
        let success = false;
        let reason: Enum | undefined;
        let tokenId: string | undefined;

        if (this.account && this.account.isLoggedIn && !this.account.isGuest)
        {
            const findSameEmailAccount = await this.db.findAccount(this.reqData!.email, {email: 1});
            if (findSameEmailAccount.result)
            {
                reason = ErrorReason.EMAIL_EXISTS;
            }
            else
            {
                const insertResult = await this.db.insertToken({
                    userId: this.account.id!,
                    email: this.reqData!.email,
                    expireDt: Date.now() + 1500,
                    type: "update_email"
                });

                if (insertResult.result)
                {
                    tokenId = insertResult.result.toString();

                    const text = "Click link to verify this email:\nhttps://s-time.online/update-email?token=" + tokenId;

                    this.email.send("", this.account.email!, "Update email request", text, text);

                    success = true;
                }
                else if (insertResult.errorReason)
                {
                    reason = insertResult.errorReason;
                }
            }
        } else
        {
            reason = ErrorReason.UNAUTHORIZED;
        }

        this.socketResponse<{ tokenId: string | undefined}>({success, reason, data: {tokenId}});

        this.resolve();
    }
}