import {AbstractCommand, ICommandMapper, ILogger, lazyInject, lazyInjectNamed} from "domwires";
import {inject, named, optional} from "inversify";
import {getCommandClassByAlias} from "../Global";
import {Types} from "../Types";

export class ExecuteCliCommand extends AbstractCommand
{
    @lazyInject(Types.ICommandMapper)
    private commandMapper!: ICommandMapper;

    @inject("string") @named("commandMapperId") @optional()
    private commandMapperId!: string;

    @lazyInject(Types.ILogger)
    private logger!: ILogger;

    @lazyInjectNamed("string", "value")
    private value!: string;

    public override execute(): void
    {
        super.execute();

        const splittedValue: string[] = this.value.split(":");

        let commandContextId;

        if (this.commandMapperId)
        {
            commandContextId = splittedValue[1];
        }

        const commandAlias = splittedValue[commandContextId ? 2 : 1];
        let paramsJsonString = this.value.substring(this.value.indexOf("{") + 1, this.value.lastIndexOf("}")).
            replace(/\s/g, '');

        let params;

        try
        {
            if (paramsJsonString)
            {
                paramsJsonString = "{" + paramsJsonString + "}";
                params = JSON.parse(paramsJsonString);
            }
        } catch (e)
        {
            this.logger.error(e);
        }

        if (commandContextId === this.commandMapperId)
        {
            this.logger.warn("\nCLI command in '" + this.commandMapper.constructor.name + "':\nCommand name: " +
                commandAlias + (params ? "\nCommand data: " + JSON.stringify(params) : ""));

            try
            {
                const cmd = getCommandClassByAlias(commandAlias);
                if (cmd)
                {
                    this.commandMapper.executeCommand(cmd, params);
                }
            } catch (e)
            {
                this.logger.error(e);
            }
        }
    }
}