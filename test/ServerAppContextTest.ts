/* eslint-disable @typescript-eslint/no-empty-function */
import "reflect-metadata";

import "../src/com/domwires/devkit/server/main/context/IServerAppContext";

import {Done, Suite} from "mocha";
import {Factory, Logger, LogLevel} from "domwires";
import {
    IServerAppContext,
    ServerAppContextMessageType
} from "../src/com/domwires/devkit/server/main/context/IServerAppContext";
import {FactoriesConfig} from "../src/com/domwires/devkit/common/context/IAppContext";
import {ConfigIds} from "../src/com/domwires/devkit/server/ConfigIds";
import {Types} from "../src/com/domwires/devkit/common/Types";

describe('ServerAppContextTest', function (this: Suite)
{
    let mainContext: IServerAppContext;

    const factoriesConfig: FactoriesConfig = {
        modelFactory: new Map([
            [ConfigIds.netEnabled, {value: true}],
            [ConfigIds.netHost, {value: "127.0.0.1"}],
            [ConfigIds.httpPort, {value: 3123}],
            [ConfigIds.socketPort, {value: 3124}],
            [ConfigIds.dbName, {value: "devkit_db"}],
            [ConfigIds.dbHost, {value: "127.0.0.1"}],
            [ConfigIds.dbPort, {value: 27017}]
        ])
    };

    beforeEach(() =>
    {

    });

    afterEach((done: Done) =>
    {
        mainContext.addMessageListener(ServerAppContextMessageType.DISPOSED, () => done());
        mainContext.dispose();
    });

    it('testInitializedWithoutErrors', (done: Done) =>
    {
        const f = new Factory(new Logger(LogLevel.INFO));
        f.mapToValue(Types.IFactory, f);
        f.mapToValue(Types.FactoriesConfig, factoriesConfig);
        mainContext = f.getInstance<IServerAppContext>(Types.IServerAppContext);
        mainContext.addMessageListener(ServerAppContextMessageType.INITIALIZED, () => done());
    });
});