import {AbstractCommand} from "domwires";
import {Types} from "../../../common/Types";
import {INetClientService} from "../../common/service/net/INetClientService";
import {inject} from "inversify";

export abstract class AbstractMainContextCommand extends AbstractCommand
{
    @inject(Types.INetClientService)
    protected netClient!: INetClientService;
}