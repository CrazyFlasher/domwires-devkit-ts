import {AbstractService} from "../../../../../../common/service/AbstractService";
import {EmailServiceConfig, EmailServiceMessageType, IEmailService} from "../IEmailService";
import {inject} from "inversify";
import {Types} from "../../../../../../common/Types";
import * as nodemailer from 'nodemailer';
import {Transporter} from 'nodemailer';

export class NodemailerEmailService extends AbstractService implements IEmailService
{
    @inject(Types.ServiceConfig)
    private emailServiceConfig!: EmailServiceConfig;

    private transporter!: Transporter;

    protected override continueInit(): void
    {
        this.transporter = nodemailer.createTransport({
            host: this.emailServiceConfig.host,
            port: this.emailServiceConfig.port,
            auth: {
                user: this.emailServiceConfig.authUser,
                pass: this.emailServiceConfig.authPassword
            }
        });

        this.transporter.verify().then(() =>
        {
            this.initSuccess();
        }).catch(reason =>
        {
            this.error(reason);
            this.initFail();
        });
    }

    public send(from: string, to: string | string[], subject: string, text: string, html?: string): IEmailService
    {
        if (!this.checkEnabled() || !this.checkInitialized()) return this;

        this.transporter.sendMail({
            from, to, subject, text, html: !html ? text : html
        }).then(value =>
        {
            this.info("Email sent:", value);

            this.dispatchMessage(EmailServiceMessageType.SEND_SUCCESS);
        }).catch(reason =>
        {
            /* eslint-disable-next-line prefer-rest-params */
            this.error("Failed to send email:", arguments, reason);

            this.dispatchMessage(EmailServiceMessageType.SEND_FAIL);
        });

        return this;
    }
}