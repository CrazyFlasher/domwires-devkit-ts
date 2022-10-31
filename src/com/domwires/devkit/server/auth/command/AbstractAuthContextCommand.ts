import {AbstractCommand, IFactoryImmutable} from "domwires";
import {inject} from "inversify";
import {ISocketServerService} from "../../common/service/net/socket/ISocketServerService";
import {IDataBaseService} from "../../common/service/net/db/IDataBaseService";
import {Types} from "../../../common/Types";
import {IAccountModelContainer} from "../../../common/model/IAccountModelContainer";

export abstract class AbstractAuthContextCommand extends AbstractCommand
{
    @inject(Types.ISocketServerService)
    protected socket!: ISocketServerService;

    @inject(Types.IDataBaseService)
    protected db!: IDataBaseService;

    @inject(Types.IAccountModelContainer)
    protected accounts!: IAccountModelContainer;

    @inject(Types.IFactory)
    protected factory!: IFactoryImmutable;

    protected get queryRelatedToClientId(): string
    {
        if (!this.db.query || !this.db.query.relatedToClientId)
        {
            throw new Error("'relatedToClientId' not defined");
        }

        return this.db.query.relatedToClientId;
    }
}