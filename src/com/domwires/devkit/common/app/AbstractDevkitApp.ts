import {AppContextConfigBuilder, FactoriesConfig} from "./context/IAppContext";
import {postConstruct} from "inversify";
import {Factory, IFactory, Logger, LogLevel} from "domwires";
import {Types} from "../Types";
import {AbstractApp} from "domwires/dist/com/domwires/core/app/AbstractApp";
import {DwError} from "../DwError";

export class AbstractDevkitApp extends AbstractApp<FactoriesConfig>
{
    @postConstruct()
    private startUp(): void
    {
        this.loadConfig(success =>
        {
            if (success)
            {
                this.initApp();
            }
            else
            {
                this.fatal("Failed to start App!");
            }
        });
    }

    private initApp(): void
    {
        const factory: IFactory = new Factory(new Logger(LogLevel.VERBOSE));
        factory.mapToValue(Types.IFactory, factory);
        factory.mapToValue(Types.FactoriesConfig, this.appConfigJson);

        const contextConfigBuilder = new AppContextConfigBuilder();
        contextConfigBuilder.defaultCliUI = true;

        factory.mapToValue(Types.ContextConfig, contextConfigBuilder.build());

        factory.getInstance(this.mainContextType);
    }

    protected get mainContextType(): string
    {
        throw new Error(DwError.OVERRIDE.name);
    }
}