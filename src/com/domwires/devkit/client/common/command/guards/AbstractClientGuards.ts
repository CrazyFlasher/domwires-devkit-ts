import {AbstractGuards} from "domwires";
import {inject} from "inversify";
import {Types} from "../../../../common/Types";
import {INetClientService} from "../../service/net/INetClientService";

export abstract class AbstractClientGuards extends AbstractGuards
{
    @inject(Types.INetClientService)
    protected netClient!: INetClientService;
}