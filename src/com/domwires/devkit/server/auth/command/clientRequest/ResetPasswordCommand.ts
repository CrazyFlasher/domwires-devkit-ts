import {AccountDto} from "../../../../common/net/Dto";
import {AbstractClientRequestHandler} from "./AbstractClientRequestHandler";

export class ResetPasswordCommand extends AbstractClientRequestHandler<AccountDto>
{
    protected override async process()
    {
        if (this.account)
        {
            const result = await this.db.findAccount<{ password: number }>(this.reqData!.email, {password: 0});

            const foundAccount = result.result && result.result[0];

            let success = false;
            let reason = result.errorReason;
            let tokenId: string | undefined;

            if (foundAccount)
            {
                const insertResult = await this.db.insertToken({
                    userId: foundAccount._id!,
                    expireDt: Date.now() + 1500,
                    type: "reset_password"
                });

                success = insertResult.result != undefined;
                reason = insertResult.errorReason;

                if (success)
                {
                    tokenId = insertResult.result!.toString();

                    const text = "Click link to reset password:\nhttps://s-time.online/password-reset?token=" + tokenId;

                    this.email.send("", foundAccount.email!, "Password reset", text, text);
                }
            }

            this.socketResponse<{ tokenId: string | undefined }>({success, reason, data: {tokenId}});
        }

        this.resolve();
    }
}