import {AbstractCommand, Class, getClassFromString, ICommand, ICommandMapper, lazyInjectNamed} from "domwires";
import {inject} from "inversify";
import {DW_TYPES} from "../dw_consts";

export class ExecuteCliCommand extends AbstractCommand
{
    @inject(DW_TYPES.ICommandMapper)
    private commandMapper!: ICommandMapper;

    @lazyInjectNamed("string", "value")
    private value!: string;

    public override execute(): void
    {
        super.execute();

        console.log("ExecuteCliCommand: ", this.value);

        const cmd: Class<ICommand> = getClassFromString(this.value.split("cmd ")[1]);
        this.commandMapper.executeCommand(cmd);
    }
}