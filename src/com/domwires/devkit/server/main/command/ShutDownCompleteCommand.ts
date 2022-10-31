import {AbstractCommand} from "domwires";
import {inject} from "inversify";
import {Types} from "../../../common/Types";
import {IServerAppContext} from "../context/IServerAppContext";

export class ShutDownCompleteCommand extends AbstractCommand
{
    @inject(Types.IServerAppContext)
    private context!: IServerAppContext;

    public override execute(): void
    {
        super.execute();

        this.context.shutDownComplete();
    }
}