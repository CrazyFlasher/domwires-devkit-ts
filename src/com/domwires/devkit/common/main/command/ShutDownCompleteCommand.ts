import {AbstractCommand} from "domwires";
import {inject} from "inversify";
import {Types} from "../../Types";
import {IMainContext} from "../context/IMainContext";

export class ShutDownCompleteCommand extends AbstractCommand
{
    @inject(Types.IAppContext)
    private context!: IMainContext;

    public override execute(): void
    {
        super.execute();

        this.context.shutDownComplete();
    }
}