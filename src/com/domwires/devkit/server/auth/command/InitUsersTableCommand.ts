import {AbstractAuthContextCommand} from "./AbstractAuthContextCommand";
import {Collection} from "../../common/Collection";

export class InitUsersTableCommand extends AbstractAuthContextCommand
{
    public override execute(): void
    {
        super.execute();

        this.db.createCollection([{name: Collection.USERS.name, uniqueIndexList: ["email"]}]);
    }
}