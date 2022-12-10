import {IService, IServiceImmutable} from "../../../../../common/service/IService";
import {MessageType} from "domwires";
import {NetServerServiceConfig} from "../INetServerService";

export type EmailServiceConfig = NetServerServiceConfig & {
    readonly authUser: string;
    readonly authPassword: string;
};

export class EmailServiceMessageType extends MessageType
{
    public static readonly SEND_SUCCESS: EmailServiceMessageType = new EmailServiceMessageType();
    public static readonly SEND_FAIL: EmailServiceMessageType = new EmailServiceMessageType();
}

export interface IEmailServiceImmutable extends IServiceImmutable
{

}

export interface IEmailService extends IEmailServiceImmutable, IService
{
    send(from: string, to: string | string[], subject: string, text: string, html?: string): IEmailService;
}

