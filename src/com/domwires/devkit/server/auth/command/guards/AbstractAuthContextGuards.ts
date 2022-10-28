import {AbstractGuards} from "domwires";
import {inject} from "inversify";
import {ISocketServerService} from "../../../common/service/net/socket/ISocketServerService";
import {Types} from "../../../../common/Types";
import {IDataBaseService} from "../../../common/service/net/db/IDataBaseService";
import {IAccountModel} from "../../../../common/model/IAccountModel";

export abstract class AbstractAuthContextGuards extends AbstractGuards
{
    @inject(Types.ISocketServerService)
    protected socket!: ISocketServerService;

    @inject(Types.IDataBaseService)
    protected db!: IDataBaseService;

    @inject("Map<string, IAccountModel>")
    protected accountModelMap!: Map<string, IAccountModel>;

    protected get queryClientId(): string | undefined
    {
        if (this.db.query && this.db.query.relatedToClientId)
        {
            return this.db.query.relatedToClientId;
        }

        return undefined;
    }

    protected getAccount(clientId: string | undefined): IAccountModel | undefined
    {
        return clientId ? this.accountModelMap.get(clientId) : undefined;
    }
}