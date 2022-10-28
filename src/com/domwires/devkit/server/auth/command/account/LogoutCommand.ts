import {AbstractAccountCommand} from "./AbstractAccountCommand";

export class LogoutCommand extends AbstractAccountCommand
{
    public override execute()
    {
        super.execute();

        this.socket.disconnectClient(this.clientId);
    }
}