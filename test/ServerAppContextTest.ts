/* eslint-disable @typescript-eslint/no-empty-function */
import "reflect-metadata";

import "../src/com/domwires/devkit/server/main/context/IServerMainContext";

import {Suite} from "mocha";
import {Factory, Logger, LogLevel} from "domwires";
import {IServerMainContext,} from "../src/com/domwires/devkit/server/main/context/IServerMainContext";
import {AppContextMessageType, FactoriesConfig} from "../src/com/domwires/devkit/common/app/context/IAppContext";
import {ConfigIds} from "../src/com/domwires/devkit/common/ConfigIds";
import {Types} from "../src/com/domwires/devkit/common/Types";
import {ServerConfigIds} from "../src/com/domwires/devkit/server/ServerConfigIds";

describe('ServerAppContextTest', function (this: Suite)
{
    let mainContext: IServerMainContext;

    const factoriesConfig: FactoriesConfig = {
        modelFactory: new Map([
            [ConfigIds.netHost, {value: "127.0.0.1"}],
            [ConfigIds.httpPort, {value: 3123}],
            [ConfigIds.socketPort, {value: 3124}],
            [ServerConfigIds.dbName, {value: "devkit_db"}],
            [ServerConfigIds.dbHost, {value: "127.0.0.1"}],
            [ServerConfigIds.dbPort, {value: 27017}]
        ])
    };

    beforeEach(() =>
    {

    });

    afterEach((done) =>
    {
        mainContext.addMessageListener(AppContextMessageType.DISPOSED, message =>
        {
            if (message && message.initialTarget == mainContext)
            {
                done();
            }
        });
        mainContext.dispose();
    });

    it('testInitializedWithoutErrors', (done) =>
    {
        const f = new Factory(new Logger(LogLevel.INFO));
        f.mapToValue(Types.IFactory, f);
        f.mapToValue(Types.FactoriesConfig, factoriesConfig);
        mainContext = f.getInstance<IServerMainContext>(Types.IServerMainContext);
        mainContext.addMessageListener(AppContextMessageType.READY, message =>
        {
            if (message && message.initialTarget == mainContext)
            {
                done();
            }
        });
    });
});