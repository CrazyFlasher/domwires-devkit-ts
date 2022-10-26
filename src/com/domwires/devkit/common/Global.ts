// TODO: remove Global

import {Class, definableFromString, ICommand, Logger, LogLevel} from "domwires";

const commandAliasToClassMap: Map<string, Class<ICommand>> = new Map<string, Class<ICommand>>();
const commandAliasToDescriptionMap: Map<string, string> = new Map<string, string>();

const logger = new Logger(LogLevel.INFO);

export function registerCommandAlias(commandClass: Class<ICommand>, alias: string, description?: string): void
{
    if (alias === "/help")
    {
        logger.warn("Cannot register command alias: \"/help\" is reserved");
    } else
    {
        definableFromString(commandClass, alias);

        commandAliasToClassMap.set(alias, commandClass);

        if (description)
        {
            commandAliasToDescriptionMap.set(alias, description);
        }
    }
}

export function getCommandClassByAlias(alias: string): Class<ICommand> | undefined
{
    if (commandAliasToClassMap.has(alias))
    {
        return commandAliasToClassMap.get(alias);
    }

    logger.warn("Cannot find command by alias '" + alias + "'. Did you call 'registerCommandAlias?");

    return undefined;
}

type TableEntity = {
    alias: string;
    clazz: string;
    desc?: string;
};

export function printMappedToAliasCommandsToConsole(): void
{
    const aliasToClassMap = getCommandAliasToClassMap();
    const aliasToDescMap = getCommandAliasDescriptionMap();

    const collection: TableEntity[] = [];

    for (const [alias, clazz] of aliasToClassMap)
    {
        let desc;

        if (aliasToDescMap.has(alias))
        {
            desc = aliasToDescMap.get(alias);
        }

        const entity: TableEntity = {alias, clazz: clazz.name};
        if (desc) entity.desc = desc;

        collection.push(entity);
    }

    console.table(collection);
}

function getCommandAliasToClassMap(): ReadonlyMap<string, Class<ICommand>>
{
    return commandAliasToClassMap;
}

function getCommandAliasDescriptionMap(): ReadonlyMap<string, string>
{
    return commandAliasToDescriptionMap;
}