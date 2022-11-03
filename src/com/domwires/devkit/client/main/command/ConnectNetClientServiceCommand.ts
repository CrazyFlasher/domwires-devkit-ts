import {AbstractMainContextCommand} from "./AbstractMainContextCommand";

export class ConnectNetClientServiceCommand extends AbstractMainContextCommand
{
    public override execute(): void
    {
        super.execute();

        this.netClient.connect();
    }
}