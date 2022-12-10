import {ObjectId} from "bson";
import {ErrorReason} from "../../../../common/ErrorReason";
import {AbstractClientRequestHandler} from "./AbstractClientRequestHandler";
import {Enum} from "domwires";

export class ConfirmUpdateEmailCommand extends AbstractClientRequestHandler
{
    protected override async process()
    {
        const tokenId = this.requestQueryParams("token")!;

        let success = false;
        let reason: Enum | undefined;

        const findTokenResult = await this.db.findToken(new ObjectId(tokenId));

        if (findTokenResult.result)
        {
            const token = findTokenResult.result[0];
            const newEmail = token.email!;

            const findAccountResult = await this.db.findAccount(token.userId);

            if (findAccountResult.result)
            {
                const account = findAccountResult.result[0];

                await this.db.deleteToken(token._id!);

                if (token.expireDt >= Date.now())
                {
                    const findSameEmailAccount = await this.db.findAccount(newEmail, {email: 1});
                    if (findSameEmailAccount.result)
                    {
                        reason = ErrorReason.EMAIL_EXISTS;
                    } else
                    {
                        await this.db.updateAccountEmail(account._id!, newEmail);

                        const text = "Email updated! New email is: " + newEmail;

                        this.email.send("", [account.email, newEmail], "New email is set", text, text);

                        success = true;
                    }
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