import {AbstractResponseCommand} from "./AbstractResponseCommand";

export class UpdatePasswordResponseCommand extends AbstractResponseCommand
{
    protected override handleSuccessResult(): void
    {
        super.handleSuccessResult();

        this.account.confirmPresetSnapshot();
    }

    protected override handleFailResult(reason: string | undefined): void
    {
        super.handleFailResult(reason);
    }
}