import {SocketResponseCommand} from "./SocketResponseCommand";
import {SocketAction} from "../../../../common/net/SocketAction";

export class RegisterResponseCommand extends SocketResponseCommand
{
    protected override getAction(): SocketAction
    {
        return SocketAction.REGISTER;
    }
}