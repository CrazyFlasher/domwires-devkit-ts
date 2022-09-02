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
import {DW_TYPES} from "../dw_consts";

export class ExecuteCliCommand extends AbstractCommand
{
    @lazyInject(DW_TYPES.ICommandMapper)
    private commandMapper!: ICommandMapper;

    @lazyInjectNamed("string", "commandMapperId")
    private commandMapperId!: string;

    @lazyInject(DW_TYPES.ILogger)
    private logger!: ILogger;

    @lazyInjectNamed("string", "value")
    private value!: string;

    public override execute(): void
    {
        super.execute();

        const splittedValue: string[] = this.value.split(":");
        const commandContextId = splittedValue[1];
        const commandAlias = splittedValue[2];

        if (commandContextId === this.commandMapperId)
        {
            this.logger.info("ExecuteCliCommand in '" + this.commandMapper.constructor.name + "': ", commandAlias);

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
}