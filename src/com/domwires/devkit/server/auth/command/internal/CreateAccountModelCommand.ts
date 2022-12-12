import {AbstractAuthContextCommand} from "../common/AbstractAuthContextCommand";
import {Types} from "../../../../common/Types";
import {lazyInjectNamed} from "domwires";

export class CreateAccountModelCommand extends AbstractAuthContextCommand
{
    @lazyInjectNamed(Types.string, "clientId")
    private connectedClientId!: string;

    public override execute(): void
    {
        super.execute();

        try
        {
            this.accounts.add(this.factory.getInstance(Types.IAccountModel), this.connectedClientId);
        } catch (e)
        {
            this.logger.warn("'clientId' is not injected!");
        }
    }
}