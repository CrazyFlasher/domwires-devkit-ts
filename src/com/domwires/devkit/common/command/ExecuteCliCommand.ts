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
import {inject, named, optional} from "inversify";

export class ExecuteCliCommand extends AbstractCommand
{
    @lazyInject(DW_TYPES.ICommandMapper)
    private commandMapper!: ICommandMapper;

    @inject("string") @named("commandMapperId") @optional()
    private commandMapperId!: string;

    @lazyInject(DW_TYPES.ILogger)
    private logger!: ILogger;

    @lazyInjectNamed("string", "value")
    private value!: string;

    public override execute(): void
    {
        super.execute();

        if (!this.commandMapperId)
        {
            this.logger.warn("'commandMapperId' is not specified and injected. Command will be executed in root context");
        }

        const splittedValue: string[] = this.value.split(":");

        let commandContextId;

        if (this.commandMapperId)
        {
            commandContextId = splittedValue[1];
        }

        const commandAlias = splittedValue[commandContextId ? 2 : 1];

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