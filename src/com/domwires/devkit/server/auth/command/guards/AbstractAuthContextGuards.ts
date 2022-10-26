import {AbstractGuards} from "domwires";
import {inject} from "inversify";
import {ISocketServerService} from "../../../common/service/net/socket/ISocketServerService";
import {Types} from "../../../../common/Types";
import {IDataBaseService, Query} from "../../../common/service/net/db/IDataBaseService";
import {IAccountModel} from "../../../../common/model/IAccountModel";
import {SocketAction} from "../../../../common/net/SocketAction";

export class AbstractAuthContextGuards extends AbstractGuards
{
    @inject(Types.ISocketServerService)
    protected socket!: ISocketServerService;

    @inject(Types.IDataBaseService)
    protected db!: IDataBaseService;

    @inject("Map<string, IAccountModel>")
    protected accountModelMap!: Map<string, IAccountModel>;

    protected get query(): Query | undefined
    {
        return this.db.query;
    }

    protected get queryClientId(): string | undefined
    {
        if (this.query && this.query.relatedToClientId)
        {
            return this.query.relatedToClientId;
        }

        return undefined;
    }

    protected get action(): SocketAction | undefined
    {
        return SocketAction.get(this.socket.getRequestData<string>().action);
    }

    protected getAccount(clientId: string | undefined): IAccountModel | undefined
    {
        return clientId ? this.accountModelMap.get(clientId) : undefined;
    }
}