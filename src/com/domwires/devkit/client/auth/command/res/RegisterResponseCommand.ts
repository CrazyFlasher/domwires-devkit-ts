import {AbstractResponseCommand} from "./AbstractResponseCommand";

export class RegisterResponseCommand extends AbstractResponseCommand
{
    protected override handleSuccessResult(): void
    {
        super.handleSuccessResult();

        this.account.confirmPresetSnapshot();
    }

    protected override handleFailResult(reason: string | undefined): void
    {
        super.handleFailResult(reason);

        this.account.clearSnapshotValues();
    }
}