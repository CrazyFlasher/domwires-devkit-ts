import {AbstractCommand, Class, getClassFromString, ICommand, ICommandMapper, lazyInjectNamed} from "domwires";
import {inject} from "inversify";
import {CONSTS, DW_TYPES} from "../dw_consts";

export class ExecuteCliCommand extends AbstractCommand
{
    @inject(DW_TYPES.ICommandMapper)
    private commandMapper!: ICommandMapper;

    @lazyInjectNamed("string", "value")
    private value!: string;

    public override execute(): void
    {
        super.execute();

        const commandAlias = this.value.split(CONSTS.CLI_COMMAND)[1];
        console.log("ExecuteCliCommand:", commandAlias);

        const cmd: Class<ICommand> = getClassFromString(commandAlias);
        this.commandMapper.executeCommand(cmd);
    }
}