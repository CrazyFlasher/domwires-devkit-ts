import {AbstractAuthContextCommand} from "./AbstractAuthContextCommand";
import {Types} from "../../../common/Types";

export class AddAccountToMapCommand extends AbstractAuthContextCommand
{
    public override execute(): void
    {
        super.execute();

        this.accounts.add(this.factory.getInstance(Types.IAccountModel), this.socket.connectedClientId);
    }
}