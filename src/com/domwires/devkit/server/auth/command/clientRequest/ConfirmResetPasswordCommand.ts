import {ObjectId} from "bson";
import {Utils} from "../../../../common/utils/Utils";
import {ErrorReason} from "../../../../common/ErrorReason";
import {AbstractClientRequestHandler} from "./AbstractClientRequestHandler";
import {Enum} from "domwires";

export class ConfirmResetPasswordCommand extends AbstractClientRequestHandler
{
    protected override async process()
    {
        const tokenId = this.requestQueryParams("token");

        let success = false;
        let reason: Enum | undefined;

        const findTokenResult = await this.db.findToken(new ObjectId(tokenId));

        if (findTokenResult.result)
        {
            const token = findTokenResult.result[0];

            const findAccountResult = await this.db.findAccount(token.userId);

            if (findAccountResult.result)
            {
                const account = findAccountResult.result[0];

                await this.db.deleteToken(token._id!);

                if (token.expireDt >= Date.now())
                {
                    const newPass = Utils.getRandomPassword(false);

                    await this.db.updateAccountPassword(account._id!, Utils.hashPassword(newPass));

                    const text = "Password reset! New password: " + newPass;

                    this.email.send("", account.email, "New password generated", text, text);

                    success = true;
                } else
                {
                    reason = ErrorReason.TOKEN_EXPIRED;
                }
            }
        } else
        {
            reason = ErrorReason.FAILED_TO_FIND_TOKEN;
        }

        this.httpResponse({success, reason});
    }
}