import "reflect-metadata";
import "../../src/com/domwires/devkit/client/main/context/IClientMainContext";

import {AbstractClientApp} from "domwires/dist/com/domwires/core/app/IApp";
import {AppContextConfigBuilder, FactoriesConfig} from "../../src/com/domwires/devkit/common/app/context/IAppContext";
import {postConstruct} from "inversify";
import {Factory, IFactory, Logger, LogLevel} from "domwires";
import {Types} from "../../src/com/domwires/devkit/common/Types";

class SampleClientApp extends AbstractClientApp<FactoriesConfig>
{
    @postConstruct()
    private startUp(): void
    {
        this.initApp();
    }

    protected override get configPath(): string
    {
        return "./dev.json";
    }

    private async initApp()
    {
        await this.init();

        const factory: IFactory = new Factory(new Logger(LogLevel.VERBOSE));
        factory.mapToValue(Types.IFactory, factory);
        factory.mapToValue(Types.FactoriesConfig, this.appConfigJson);

        const contextConfigBuilder = new AppContextConfigBuilder();
        contextConfigBuilder.defaultCliUI = true;

        factory.mapToValue(Types.ContextConfig, contextConfigBuilder.build());

        factory.getInstance(Types.IClientMainContext);
    }
}

new Factory(new Logger(LogLevel.VERBOSE)).getInstance<SampleClientApp>(SampleClientApp);