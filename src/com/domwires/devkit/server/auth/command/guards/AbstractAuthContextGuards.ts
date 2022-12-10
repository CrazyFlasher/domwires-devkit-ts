import {AbstractGuards} from "domwires";
import {inject} from "inversify";
import {ISocketServerService} from "../../../common/service/net/socket/ISocketServerService";
import {Types} from "../../../../common/Types";
import {IAccountModelContainer} from "../../../../common/main/model/IAccountModelContainer";
import {IHttpServerService} from "../../../common/service/net/http/IHttpServerService";
import {IAuthDataBaseService} from "../../../common/service/net/db/IAuthDataBaseService";

export abstract class AbstractAuthContextGuards extends AbstractGuards
{
    @inject(Types.IHttpServerService)
    protected http!: IHttpServerService;

    @inject(Types.ISocketServerService)
    protected socket!: ISocketServerService;

    @inject(Types.IAuthDataBaseService)
    protected db!: IAuthDataBaseService;

    @inject(Types.IAccountModelContainer)
    protected accounts!: IAccountModelContainer;
}