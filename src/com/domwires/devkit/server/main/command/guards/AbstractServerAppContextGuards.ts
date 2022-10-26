import {AbstractGuards} from "domwires";
import {DwError} from "../../../../common/DwError";
import {inject} from "inversify";
import {Types} from "../../../../common/Types";
import {IHttpServerService} from "../../../common/service/net/http/IHttpServerService";
import {IDataBaseService} from "../../../common/service/net/db/IDataBaseService";
import {ISocketServerService} from "../../../common/service/net/socket/ISocketServerService";

export class AbstractServerAppContextGuards extends AbstractGuards
{
    @inject(Types.IHttpServerService)
    protected http!: IHttpServerService;

    @inject(Types.ISocketServerService)
    protected socket!: ISocketServerService;

    @inject(Types.IDataBaseService)
    protected db!: IDataBaseService;

    public override get allows(): boolean
    {
        throw new Error(DwError.OVERRIDE.name);
    }
}