import {Collection} from "../../../common/Collection";
import {SocketAction} from "../../../../common/net/SocketAction";
import {AbstractAccountCommand} from "./AbstractAccountCommand";

export class LoginCommand extends AbstractAccountCommand
{
    public override execute()
    {
        super.execute();

        const account = this.accountModelMap.get(this.clientId);

        if (this.dto && account)
        {
            account.setPassword(this.dto.password);

            this.db.find<{email: string}>({
                id: SocketAction.LOGIN,
                relatedToClientId: this.clientId
            }, Collection.USERS.name, {email: this.dto.email});
        }
    }
}