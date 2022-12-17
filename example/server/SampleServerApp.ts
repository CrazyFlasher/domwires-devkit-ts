import "reflect-metadata";
import "../../src/com/domwires/devkit/server/main/context/IServerMainContext";

import {AbstractServerApp} from "domwires/dist/com/domwires/core/app/AbstractServerApp";
import {postConstruct} from "inversify";
import {Factory, IFactory, Logger, LogLevel} from "domwires";
import {AppContextConfigBuilder, FactoriesConfig} from "../../src/com/domwires/devkit/common/app/context/IAppContext";
import {Types} from "../../src/com/domwires/devkit/common/Types";

class SampleServerApp extends AbstractServerApp<FactoriesConfig>
{
    @postConstruct()
    private startUp(): void
    {
        this.initApp();
    }

    protected override get configPath(): string
    {
        return "./example/server/dev.json";
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

        factory.getInstance(Types.IServerMainContext);
    }
}

new Factory(new Logger(LogLevel.VERBOSE)).getInstance<SampleServerApp>(SampleServerApp);