import {AbstractResponseCommand} from "./AbstractResponseCommand";

export class ResetPasswordResponseCommand extends AbstractResponseCommand
{
    protected override handleSuccessResult(): void
    {
        super.handleSuccessResult();
    }

    protected override handleFailResult(reason: string | undefined): void
    {
        super.handleFailResult(reason);
    }
}