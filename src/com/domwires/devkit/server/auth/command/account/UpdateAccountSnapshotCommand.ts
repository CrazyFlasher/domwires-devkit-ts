import {AbstractAuthContextCommand} from "../AbstractAuthContextCommand";
import {AccountDto} from "../../../../common/net/dto/Dto";

export class UpdateAccountSnapshotCommand extends AbstractAuthContextCommand
{
    public override execute(): void
    {
        super.execute();

        const account = this.accountModelMap.get(this.queryRelatedToClientId);

        if (account)
        {
            account.setSnapshot(this.db.getFindResult<AccountDto[]>()[0]);
        }
    }
}