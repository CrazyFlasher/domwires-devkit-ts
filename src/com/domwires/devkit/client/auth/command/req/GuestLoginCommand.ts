import {AbstractAuthCommand} from "../AbstractAuthCommand";
import {SocketAction} from "../../../../common/net/SocketAction";
import {ClientServiceRequestType} from "../../../common/service/net/INetClientService";

export class GuestLoginCommand extends AbstractAuthCommand
{
    public override execute(): void
    {
        super.execute();

        this.netClient.send(SocketAction.GUEST_LOGIN.name, undefined, ClientServiceRequestType.TCP);
    }
}