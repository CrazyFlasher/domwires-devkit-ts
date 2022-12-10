import {AbstractResponseCommand} from "./AbstractResponseCommand";
import {AccountDto, ResultDto} from "../../../../common/net/Dto";

export class LoginResponseCommand extends AbstractResponseCommand
{
    protected override handleSuccessResult(): void
    {
        super.handleSuccessResult();

        const accountDto = this.netClient.getResponseData<{result: ResultDto; data: AccountDto}>().data.data;

        if (accountDto._id)
        {
            this.account.setId(accountDto._id);
        }

        this.account.setIsLoggedIn(true).setIsGuest(this.isGuest);
        this.account.setSnapshot(accountDto);
    }

    protected get isGuest(): boolean
    {
        return false;
    }

    protected override handleFailResult(reason: string | undefined): void
    {
        super.handleFailResult(reason);

        this.account.clearSnapshotValues();
    }
}