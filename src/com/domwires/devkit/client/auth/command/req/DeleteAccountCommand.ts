import {AbstractAuthCommand} from "../AbstractAuthCommand";
import {SocketAction} from "../../../../common/net/SocketAction";
import {ClientServiceRequestType} from "../../../common/service/net/INetClientService";

export class DeleteAccountCommand extends AbstractAuthCommand
{
    public override execute(): void
    {
        super.execute();

        this.netClient.send(SocketAction.DELETE_ACCOUNT.name, undefined, ClientServiceRequestType.TCP);
    }
}