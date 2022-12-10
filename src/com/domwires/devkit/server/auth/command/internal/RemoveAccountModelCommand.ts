import {AbstractAuthContextCommand} from "../common/AbstractAuthContextCommand";
import {lazyInjectNamed} from "domwires";
import {Types} from "../../../../common/Types";

export class RemoveAccountModelCommand extends AbstractAuthContextCommand
{
    @lazyInjectNamed(Types.string, "clientId")
    private disconnectedClientId!: string;

    public override execute(): void
    {
        super.execute();

        this.accounts.remove(this.disconnectedClientId);
    }
}