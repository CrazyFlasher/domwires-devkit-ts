import {AbstractCommand} from "domwires";
import {inject} from "inversify";
import {Types} from "../../../../common/Types";
import {IServerAuthContext} from "../../context/IServerAuthContext";

export class MapContextCommandsCommand extends AbstractCommand
{
    @inject(Types.IServerAuthContext)
    private context!: IServerAuthContext;

    public override execute(): void
    {
        super.execute();

        this.context.mapCommands();
    }
}