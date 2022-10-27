import {SocketAction} from "../../../../common/net/SocketAction";
import {ResponseCommand} from "./ResponseCommand";

export class RegisterResponseCommand extends ResponseCommand
{
    protected override getAction(): SocketAction
    {
        return SocketAction.REGISTER;
    }
}