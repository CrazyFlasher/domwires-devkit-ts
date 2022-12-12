import {
    AbstractCommand,
    Class,
    ICommand,
    ICommandMapper,
    IGuards,
    ILogger,
    lazyInject,
    lazyInjectNamed
} from "domwires";
import {inject, named, optional} from "inversify";
import {getCommandClassByAlias, getGuardsClassByAlias, getGuardsNotClassByAlias} from "../../Global";
import {Types} from "../../Types";

export class ExecuteCliCommand extends AbstractCommand
{
    @lazyInject(Types.ICommandMapper)
    private commandMapper!: ICommandMapper;

    @inject(Types.string) @named("commandMapperId") @optional()
    private commandMapperId!: string;

    @lazyInject(Types.ILogger)
    private logger!: ILogger;

    @lazyInjectNamed(Types.string, "value")
    private value!: string;

    private hJson = require("hjson");

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

        let params: Record<string, unknown> | undefined;

        try
        {
            if (paramsJsonString)
            {
                paramsJsonString = "{" + paramsJsonString + "}";
                params = this.hJson.parse(paramsJsonString);
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
                const guards = getGuardsClassByAlias(commandAlias);
                const guardsNot = getGuardsNotClassByAlias(commandAlias);

                if (cmd)
                {
                    if (cmd instanceof Array)
                    {
                        cmd.map(value => this.exec(value, params, guards, guardsNot));
                    } else
                    {
                        this.exec(cmd, params, guards, guardsNot);
                    }
                }
            } catch (e)
            {
                this.logger.error(e);
            }
        }
    }

    private exec(cmd: Class<ICommand>, params?: Record<string, unknown>, guards?: Class<IGuards> | Class<IGuards>[],
                 guardsNot?: Class<IGuards> | Class<IGuards>[])
    {
        try
        {
            let guardsList: Class<IGuards>[] | undefined;
            if (guards)
            {
                if (guards instanceof Array)
                {
                    guardsList = guards;
                } else
                {
                    guardsList = [guards];
                }
            }

            let guardsNotList: Class<IGuards>[] | undefined;
            if (guardsNot)
            {
                if (guardsNot instanceof Array)
                {
                    guardsNotList = guardsNot;
                } else
                {
                    guardsNotList = [guardsNot];
                }
            }

            this.commandMapper.executeCommand(cmd, params, guardsList, guardsNotList);
        } catch (e)
        {
            this.logger.warn("Failed to execute command:", cmd, params);
        }
    }
}