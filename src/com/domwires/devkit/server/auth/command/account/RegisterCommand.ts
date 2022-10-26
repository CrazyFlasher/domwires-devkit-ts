import {Collection} from "../../../common/Collection";
import {SocketAction} from "../../../../common/net/SocketAction";
import {RegisterDto} from "../../../../common/net/dto/Dto";
import {AbstractAccountCommand} from "./AbstractAccountCommand";

export class RegisterCommand extends AbstractAccountCommand
{
    public override execute()
    {
        super.execute();

        if (this.dto)
        {
            this.db.insert<RegisterDto>({
                id: SocketAction.REGISTER,
                relatedToClientId: this.clientId
            }, Collection.USERS.name, [this.dto as RegisterDto]);
        }
    }
}