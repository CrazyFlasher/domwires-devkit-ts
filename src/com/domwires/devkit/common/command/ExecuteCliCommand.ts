/* eslint-disable @typescript-eslint/no-explicit-any */

import {AbstractCommand, Class, ICommand, ICommandMapper, ILogger, lazyInject, lazyInjectNamed} from "domwires";
import {inject, named, optional} from "inversify";
import {getCommandClassByAlias} from "../Global";
import {Types} from "../Types";

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

        let params: any;

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
                    if (cmd instanceof Array)
                    {
                        cmd.map(value => this.exec(value, params));
                    } else
                    {
                        this.exec(cmd, params);
                    }
                }
            } catch (e)
            {
                this.logger.error(e);
            }
        }
    }

    private exec(cmd: Class<ICommand>, params?: any): void
    {
        this.commandMapper.executeCommand(cmd, params);
    }
}