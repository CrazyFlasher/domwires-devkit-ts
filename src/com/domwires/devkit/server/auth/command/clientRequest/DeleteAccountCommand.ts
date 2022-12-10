import {AbstractClientRequestHandler} from "./AbstractClientRequestHandler";
import {Enum} from "domwires";
import {ErrorReason} from "../../../../common/ErrorReason";

export class DeleteAccountCommand extends AbstractClientRequestHandler<{ email: string }>
{
    protected override async process()
    {
        let success = false;
        let reason: Enum | undefined;
        let tokenId: string | undefined;

        if (this.account && this.account.isLoggedIn && !this.account.isGuest)
        {
            const insertResult = await this.db.insertToken({
                userId: this.account.id!,
                expireDt: Date.now() + 1500,
                type: "delete_account"
            });

            if (insertResult.result)
            {
                tokenId = insertResult.result.toString();

                const text = "Click link to complete account deletion:\nhttps://s-time.online/delete-account?token=" + tokenId;

                this.email.send("", this.account.email!, "Delete account request", text, text);

                success = true;
            } else
            if (insertResult.errorReason)
            {
                reason = insertResult.errorReason;
            }
        } else
        {
            reason = ErrorReason.UNAUTHORIZED;
        }

        this.socketResponse<{ tokenId: string | undefined }>({success, reason, data: {tokenId}});

        this.resolve();
    }
}