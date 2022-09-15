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

        const splittedValue: string[] = this.value.split(":");

        let commandContextId;

        if (this.commandMapperId)
        {
            commandContextId = splittedValue[1];
        }

        const commandAlias = splittedValue[commandContextId ? 2 : 1];
        let paramsJsonString = this.value.substring(this.value.indexOf("{") + 1, this.value.indexOf("}")).
            replace(/\s/g, '');

        let params;

        try
        {
            if (paramsJsonString)
            {
                paramsJsonString = this.formatParamsString(paramsJsonString);
                params = JSON.parse(paramsJsonString);
            }
        } catch (e)
        {
            this.logger.error(e);
        }

        if (commandContextId === this.commandMapperId)
        {
            this.logger.info("ExecuteCliCommand in '" + this.commandMapper.constructor.name + "': ", commandAlias);

            try
            {
                const cmd: Class<ICommand> = getClassFromString(commandAlias);
                this.commandMapper.executeCommand(cmd, params);
            } catch (e)
            {
                this.logger.error(e);
            }
        }
    }

    private formatParamsString(jsonString: string): string
    {
        const list = jsonString.split(",");
        const listWithQuotes: string[] = [];
        list.map(keyValue => {
            const split = keyValue.split(":");
            listWithQuotes.push('"' + split[0] + '":' + split[1]);
        });

        return "{" + listWithQuotes.toString() + "}";
    }
}