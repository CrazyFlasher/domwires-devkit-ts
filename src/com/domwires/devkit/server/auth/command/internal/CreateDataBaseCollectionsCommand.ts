import {inject} from "inversify";
import {Types} from "../../../../common/Types";
import {AbstractCommand} from "domwires";
import {IAuthDataBaseService} from "../../../common/service/net/db/IAuthDataBaseService";

export class CreateDataBaseCollectionsCommand extends AbstractCommand
{
    @inject(Types.IAuthDataBaseService)
    protected db!: IAuthDataBaseService;

    public override execute()
    {
        super.execute();

        this.db.createCollections();
    }
}