import {AbstractClientRequestHandler} from "./AbstractClientRequestHandler";
import {Enum} from "domwires";
import {SocketAction} from "../../../../common/net/SocketAction";

export class LogoutCommand extends AbstractClientRequestHandler
{
    protected override async process(): Promise<void>
    {
        this.socket.disconnectClient(this.requestFromClientId!);
    }

    protected override get cliReqAction(): Enum
    {
        return SocketAction.LOGOUT;
    }
}