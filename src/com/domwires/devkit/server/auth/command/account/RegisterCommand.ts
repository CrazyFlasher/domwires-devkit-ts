import {Collection} from "../../../common/Collection";
import {SocketAction} from "../../../../common/net/SocketAction";
import {AccountDto} from "../../../../common/net/Dto";
import {AbstractAccountCommand} from "./AbstractAccountCommand";

export class RegisterCommand extends AbstractAccountCommand
{
    public override execute()
    {
        super.execute();

        if (this.dto)
        {
            this.db.insert<AccountDto>({
                id: SocketAction.REGISTER,
                relatedToClientId: this.clientId
            }, Collection.USERS.name, [this.dto]);
        }
    }
}