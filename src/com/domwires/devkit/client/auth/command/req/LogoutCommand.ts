import {AbstractAuthCommand} from "../AbstractAuthCommand";
import {SocketAction} from "../../../../common/net/SocketAction";
import {ClientServiceRequestType} from "../../../common/service/net/INetClientService";

export class LogoutCommand extends AbstractAuthCommand
{
    public override execute(): void
    {
        super.execute();

        this.account.setIsLoggedIn(false).clearSnapshotValues();

        this.netClient.send(SocketAction.LOGOUT.name, undefined, ClientServiceRequestType.TCP);
    }
}