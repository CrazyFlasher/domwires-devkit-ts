import {SocketResponseCommand} from "./SocketResponseCommand";
import {SocketAction} from "../../../../common/net/SocketAction";

export class LoginResponseCommand extends SocketResponseCommand
{
    protected override getAction(): SocketAction
    {
        return SocketAction.LOGIN;
    }
}