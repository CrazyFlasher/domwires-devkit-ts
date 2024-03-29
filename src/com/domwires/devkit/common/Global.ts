/* eslint-disable @typescript-eslint/no-explicit-any */

// TODO: remove Global

import {Class, definableFromString, ICommand, IGuards, Logger, LogLevel} from "domwires";

const commandAliasToClassMap: Map<string, Class<ICommand> | Class<ICommand>[]> = new Map<string, Class<ICommand> | Class<ICommand>[]>();
const commandAliasToGuardsMap: Map<string, Class<IGuards> | Class<IGuards>[]> = new Map<string, Class<IGuards> | Class<IGuards>[]>();
const commandAliasToGuardsNotMap: Map<string, Class<IGuards> | Class<IGuards>[]> = new Map<string, Class<IGuards> | Class<IGuards>[]>();
const commandAliasToDescriptionMap: Map<string, string> = new Map<string, string>();
const commandAliasToParamsMap: Map<string, any> = new Map<string, any>();

const logger = new Logger(LogLevel.VERBOSE);

export function registerCommandAlias(commandClass: Class<ICommand> | Class<ICommand>[], alias: string, description?: string,
                                     params?: { name: string; type?: string; requiredValue?: string | boolean | number | object; optional?: boolean }[],
                                     guards?: Class<IGuards> | Class<IGuards>[], guardsNot?: Class<IGuards> | Class<IGuards>[]): void
{
    if (alias === "/help")
    {
        logger.warn("Cannot register command alias: \"/help\" is reserved");
    }
    else
    {
        let list: Class<ICommand>[];

        if (!(commandClass instanceof Array))
        {
            list = [];
            list.push(commandClass);
        }
        else
        {
            list = commandClass;
        }

        list.map(value =>
        {
            definableFromString(value, alias);
        });

        if (commandAliasToClassMap.has(alias))
        {
            logger.warn("Command '" + alias + "' already registered. Overwriting...");
            if (commandAliasToGuardsMap.has(alias)) commandAliasToGuardsMap.delete(alias);
            if (commandAliasToGuardsNotMap.has(alias)) commandAliasToGuardsNotMap.delete(alias);
            if (commandAliasToParamsMap.has(alias)) commandAliasToParamsMap.delete(alias);
        }

        commandAliasToClassMap.set(alias, list);
        if (guards) commandAliasToGuardsMap.set(alias, guards);
        if (guardsNot) commandAliasToGuardsNotMap.set(alias, guardsNot);

        if (params)
        {
            commandAliasToParamsMap.set(alias, paramsToString(params));
        }

        if (description)
        {
            commandAliasToDescriptionMap.set(alias, description);
        }
    }
}

function paramsToString(params: { name: string; type?: string; requiredValue?: string | boolean | number | object; optional?: boolean }[]): string
{
    let result = "";

    let count = 0;
    for (const param of params)
    {
        result += param.name + (param.optional ? "?" : "")  + (param.type ? ":" + param.type : "") + (param.requiredValue ? "=" +
            JSON.stringify(param.requiredValue).replace(/"/g, "") : "").replace(/:,/g, ",")
            .replace(/:}/g, "}") + ";";

        count++;

        if (count < params.length)
        {
            result += " ";
        }
    }

    return result;
}

export function getCommandClassByAlias(alias: string): Class<ICommand> | Class<ICommand>[] | undefined
{
    if (commandAliasToClassMap.has(alias))
    {
        return commandAliasToClassMap.get(alias);
    }

    logger.warn("Cannot find command by alias '" + alias + "'. Did you call 'registerCommandAlias?");

    return undefined;
}

export function getGuardsClassByAlias(alias: string): Class<IGuards> | Class<IGuards>[] | undefined
{
    if (commandAliasToGuardsMap.has(alias))
    {
        return commandAliasToGuardsMap.get(alias);
    }

    return undefined;
}

export function getGuardsNotClassByAlias(alias: string): Class<IGuards> | Class<IGuards>[] | undefined
{
    if (commandAliasToGuardsNotMap.has(alias))
    {
        return commandAliasToGuardsNotMap.get(alias);
    }

    return undefined;
}

type TableEntity = {
    alias: string;
    clazz: string;
    desc?: string;
    params?: string;
};

export function printMappedToAliasCommandsToConsole(): void
{
    const aliasToClassMap = getCommandAliasToClassMap();
    const aliasToDescMap = getCommandAliasToDescriptionMap();
    const aliasToParamsMap = getCommandAliasToParamsMap();

    const collection: TableEntity[] = [];

    for (const [alias, clazz] of aliasToClassMap)
    {
        let desc;
        let params;

        if (aliasToDescMap.has(alias))
        {
            desc = aliasToDescMap.get(alias);
        }

        if (aliasToParamsMap.has(alias))
        {
            params = aliasToParamsMap.get(alias);
        }

        let className = "";

        if (clazz instanceof Array)
        {
            clazz.map(value =>
            {
                className += value.name;
                if (clazz.indexOf(value) < clazz.length - 1)
                {
                    className += ", ";
                }
            });
        }
        else
        {
            className = clazz.name;
        }

        const entity: TableEntity = {alias, clazz: className};
        if (desc) entity.desc = desc;
        if (params) entity.params = params;

        collection.push(entity);
    }

    console.table(collection);

    console.info("\x1b[1mUsage:\x1b[0m");
    console.info("No params: \x1b[34m/cmd:<alias>\x1b[0m");
    console.info("With params: \x1b[34m/cmd:<alias>:{ <params> }\x1b[0m");
    console.info("With params and context id: \x1b[34m/cmd:<context_id>:<alias>:{ <params> }\x1b[0m");
}

function getCommandAliasToClassMap(): ReadonlyMap<string, Class<ICommand> | Class<ICommand>[]>
{
    return commandAliasToClassMap;
}

function getCommandAliasToDescriptionMap(): ReadonlyMap<string, string>
{
    return commandAliasToDescriptionMap;
}

function getCommandAliasToParamsMap(): ReadonlyMap<string, any>
{
    return commandAliasToParamsMap;
}