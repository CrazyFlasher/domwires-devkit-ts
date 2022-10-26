import {AbstractCommand, IFactoryImmutable} from "domwires";
import {inject} from "inversify";
import {ISocketServerService} from "../../common/service/net/socket/ISocketServerService";
import {IAccountModel} from "../../../common/model/IAccountModel";
import {IDataBaseService} from "../../common/service/net/db/IDataBaseService";
import {Types} from "../../../common/Types";

export abstract class AbstractAuthContextCommand extends AbstractCommand
{
    @inject(Types.ISocketServerService)
    protected socket!: ISocketServerService;

    @inject(Types.IDataBaseService)
    protected db!: IDataBaseService;

    @inject("Map<string, IAccountModel>")
    protected accountModelMap!: Map<string, IAccountModel>;

    @inject(Types.IFactory)
    protected factory!: IFactoryImmutable;
}