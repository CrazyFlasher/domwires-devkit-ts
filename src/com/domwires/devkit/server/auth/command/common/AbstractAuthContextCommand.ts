import {IFactoryImmutable, ILogger} from "domwires";
import {inject} from "inversify";
import {ISocketServerService} from "../../../common/service/net/socket/ISocketServerService";
import {Types} from "../../../../common/Types";
import {IAccountModelContainer} from "../../../../common/main/model/IAccountModelContainer";
import {IHttpServerService} from "../../../common/service/net/http/IHttpServerService";
import {IAuthDataBaseService} from "../../../common/service/net/db/IAuthDataBaseService";
import {AbstractAsyncCommand} from "domwires/dist/com/domwires/core/mvc/command/AbstractAsyncCommand";
import {IEmailService} from "../../../common/service/net/email/IEmailService";

export abstract class AbstractAuthContextCommand extends AbstractAsyncCommand
{
    @inject(Types.IHttpServerService)
    protected http!: IHttpServerService;

    @inject(Types.ISocketServerService)
    protected socket!: ISocketServerService;

    @inject(Types.IAuthDataBaseService)
    protected db!: IAuthDataBaseService;

    @inject(Types.IEmailService)
    protected email!: IEmailService;

    @inject(Types.IAccountModelContainer)
    protected accounts!: IAccountModelContainer;

    @inject(Types.IFactory)
    protected factory!: IFactoryImmutable;

    @inject(Types.ILogger)
    protected logger!: ILogger;
}