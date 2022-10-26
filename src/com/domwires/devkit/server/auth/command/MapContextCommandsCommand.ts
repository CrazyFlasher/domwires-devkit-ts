import {AbstractCommand} from "domwires";
import {inject} from "inversify";
import {Types} from "../../../common/Types";
import {IAuthContext} from "../context/IAuthContext";

export class MapContextCommandsCommand extends AbstractCommand
{
    @inject(Types.IAuthContext)
    private context!: IAuthContext;

    public override execute(): void
    {
        super.execute();

        this.context.mapCommands();
    }
}