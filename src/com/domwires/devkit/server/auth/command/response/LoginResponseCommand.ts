import {SocketAction} from "../../../../common/net/SocketAction";
import {ResponseCommand} from "./ResponseCommand";

export class LoginResponseCommand extends ResponseCommand
{
    protected override getAction(): SocketAction
    {
        return SocketAction.LOGIN;
    }
}