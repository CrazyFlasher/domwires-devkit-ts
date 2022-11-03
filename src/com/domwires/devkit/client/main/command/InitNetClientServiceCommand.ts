import {AbstractMainContextCommand} from "./AbstractMainContextCommand";

export class InitNetClientServiceCommand extends AbstractMainContextCommand
{
    public override execute(): void
    {
        super.execute();

        this.netClient.init();
    }
}