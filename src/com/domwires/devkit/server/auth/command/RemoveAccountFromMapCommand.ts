import {AbstractAuthContextCommand} from "./AbstractAuthContextCommand";

export class RemoveAccountFromMapCommand extends AbstractAuthContextCommand
{
    public override execute(): void
    {
        super.execute();

        this.accountModelMap.delete(this.socket.disconnectedClientId);
    }
}