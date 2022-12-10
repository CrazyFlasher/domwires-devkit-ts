import {AbstractCommand, ILogger} from "domwires";
import {inject} from "inversify";
import {Types} from "../../../common/Types";
import {INetClientService} from "../../common/service/net/INetClientService";
import {IAccountModel} from "../../../common/main/model/IAccountModel";

export abstract class AbstractAuthCommand extends AbstractCommand
{
    @inject(Types.INetClientService)
    protected netClient!: INetClientService;

    @inject(Types.IAccountModel)
    protected account!: IAccountModel;

    @inject(Types.ILogger)
    protected logger!: ILogger;
}