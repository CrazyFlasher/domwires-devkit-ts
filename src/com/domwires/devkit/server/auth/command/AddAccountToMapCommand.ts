import {AbstractAuthContextCommand} from "./AbstractAuthContextCommand";
import {Types} from "../../../common/Types";

export class AddAccountToMapCommand extends AbstractAuthContextCommand
{
    public override execute(): void
    {
        super.execute();

        this.accountModelMap.set(this.socket.connectedClientId, this.factory.getInstance(Types.IAccountModel));
    }
}