import {
    AbstractCommand,
    Class,
    getClassFromString,
    ICommand,
    ICommandMapper,
    ILogger,
    lazyInject,
    lazyInjectNamed
} from "domwires";
import {CONSTS, DW_TYPES} from "../dw_consts";

export class ExecuteCliCommand extends AbstractCommand
{
    @lazyInject(DW_TYPES.ICommandMapper)
    private commandMapper!: ICommandMapper;

    @lazyInject(DW_TYPES.ILogger)
    private logger!: ILogger;

    @lazyInjectNamed("string", "value")
    private value!: string;

    public override execute(): void
    {
        super.execute();

        const commandAlias = this.value.split(CONSTS.CLI_COMMAND)[1];
        this.logger.info("ExecuteCliCommand:", commandAlias);

        try
        {
            const cmd: Class<ICommand> = getClassFromString(commandAlias);
            this.commandMapper.executeCommand(cmd);
        } catch (e)
        {
            this.logger.error(e);
        }
    }
}