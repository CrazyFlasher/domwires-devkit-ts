/* eslint-disable @typescript-eslint/no-empty-function */

import "reflect-metadata";
import {Suite} from "mocha";
import {Factory, IFactory, Logger, LogLevel} from "domwires";
import {Types} from "../src/com/domwires/devkit/common/Types";
import {
    EmailServiceConfig,
    EmailServiceMessageType,
    IEmailService
} from "../src/com/domwires/devkit/server/common/service/net/email/IEmailService";
import {
    NodemailerEmailService
} from "../src/com/domwires/devkit/server/common/service/net/email/impl/NodemailerEmailService";
import {ServiceMessageType} from "../src/com/domwires/devkit/common/service/IService";
import * as dotenv from "dotenv";

dotenv.config();

(process.env.EMAIL_PASSWORD ? describe : describe.skip)('EmailServiceTest', function (this: Suite)
{
    let factory: IFactory;
    let service: IEmailService;

    beforeEach((done) =>
    {
        factory = new Factory(new Logger(LogLevel.VERBOSE));
        factory.mapToType<IEmailService>(Types.IEmailService, NodemailerEmailService);

        const config: EmailServiceConfig = {
            host: process.env.EMAIL_HOST!,
            port: parseInt(process.env.EMAIL_PORT!),
            authUser: process.env.EMAIL_USER!,
            authPassword: process.env.EMAIL_PASSWORD ? process.env.EMAIl_PASSWORD! : ""
        };

        factory.mapToValue<EmailServiceConfig>(Types.ServiceConfig, config);

        service = factory.getInstance<IEmailService>(Types.IEmailService);

        service.addMessageListener(ServiceMessageType.INIT_SUCCESS, () =>
        {
            done();
        }, true);

        service.init();
    });

    afterEach(() =>
    {
        service.dispose();
        factory.dispose();
    });

    it('testSendSuccess', (done) =>
    {
        service.addMessageListener(EmailServiceMessageType.SEND_SUCCESS, () =>
        {
            done();
        }, true);

        service.send("Onthosha Ololoev", process.env.EMAIL_RECIPIENT!, "Preved!", "Bush cho, a jest?", "<b>Bush cho, a jest?</b>");
    });
});