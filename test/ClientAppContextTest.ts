/* eslint-disable @typescript-eslint/no-empty-function */

import "reflect-metadata";

import "../src/com/domwires/devkit/server/main/context/IServerMainContext";
import "../src/com/domwires/devkit/client/main/context/IClientMainContext";

import {Suite} from "mocha";
import {IServerMainContext} from "../src/com/domwires/devkit/server/main/context/IServerMainContext";
import {AppContextMessageType, FactoriesConfig} from "../src/com/domwires/devkit/common/app/context/IAppContext";
import {ConfigIds} from "../src/com/domwires/devkit/common/ConfigIds";
import {ServerConfigIds} from "../src/com/domwires/devkit/server/ServerConfigIds";
import {Factory, Logger, LogLevel} from "domwires";
import {Types} from "../src/com/domwires/devkit/common/Types";
import {IClientMainContext} from "../src/com/domwires/devkit/client/main/context/IClientMainContext";

describe('ClientAppContextTest', function (this: Suite)
{
    let serverContext: IServerMainContext;

    let mainContext: IClientMainContext;

    const serverFactoriesConfig: FactoriesConfig = {
        modelFactory: new Map([
            [ConfigIds.netHost, {value: "127.0.0.1"}],
            [ConfigIds.httpPort, {value: 3123}],
            [ConfigIds.socketPort, {value: 3124}],
            [ServerConfigIds.dbName, {value: "devkit_db"}],
            [ServerConfigIds.dbHost, {value: "127.0.0.1"}],
            [ServerConfigIds.dbPort, {value: 27017}]
        ])
    };

    const clientFactoriesConfig: FactoriesConfig = {
        modelFactory: new Map([
            [ConfigIds.netHost, {value: "127.0.0.1"}],
            [ConfigIds.httpPort, {value: 3123}],
            [ConfigIds.socketPort, {value: 3124}]
        ])
    };

    beforeEach((done) =>
    {
        const f = new Factory(new Logger(LogLevel.INFO));
        f.mapToValue(Types.IFactory, f);
        f.mapToValue(Types.FactoriesConfig, serverFactoriesConfig);
        serverContext = f.getInstance<IServerMainContext>(Types.IServerMainContext);
        serverContext.addMessageListener(AppContextMessageType.READY, message =>
        {
            if (message && message.initialTarget == serverContext)
            {
               done();
            }
        });
    });

    afterEach((done) =>
    {
        mainContext.addMessageListener(AppContextMessageType.DISPOSED, message =>
        {
            if (message && message.initialTarget == mainContext)
            {
                serverContext.addMessageListener(AppContextMessageType.DISPOSED, message =>
                {
                    if (message && message.initialTarget == serverContext)
                    {
                        done();
                    }
                });
                serverContext.dispose();
            }
        });
        mainContext.dispose();
    });

    it('testInitializedWithoutErrors', (done) =>
    {
        const f = new Factory(new Logger(LogLevel.INFO));
        f.mapToValue(Types.IFactory, f);
        f.mapToValue(Types.FactoriesConfig, clientFactoriesConfig);
        mainContext = f.getInstance<IClientMainContext>(Types.IClientMainContext);
        mainContext.addMessageListener(AppContextMessageType.READY, message =>
        {
            if (message && message.initialTarget == mainContext)
            {
                done();
            }
        });
    });
});