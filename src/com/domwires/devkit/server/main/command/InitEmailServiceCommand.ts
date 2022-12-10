import {AbstractCommand} from "domwires";
import {inject} from "inversify";
import {Types} from "../../../common/Types";
import {IEmailService} from "../../common/service/net/email/IEmailService";

export class InitEmailServiceCommand extends AbstractCommand
{
    @inject(Types.IEmailService)
    protected email!: IEmailService;

    public override execute(): void
    {
        super.execute();

        this.email.init();
    }
}