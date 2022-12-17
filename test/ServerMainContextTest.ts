/* eslint-disable @typescript-eslint/no-empty-function */
import "reflect-metadata";

import "../src/com/domwires/devkit/server/main/context/IServerMainContext";
import "../src/com/domwires/devkit/server/ServerDefs";

import {Suite} from "mocha";
import {Factory, Logger, LogLevel} from "domwires";
import {IServerMainContext,} from "../src/com/domwires/devkit/server/main/context/IServerMainContext";
import {AppContextMessageType, FactoriesConfig} from "../src/com/domwires/devkit/common/app/context/IAppContext";
import {ConfigIds} from "../src/com/domwires/devkit/common/ConfigIds";
import {Types} from "../src/com/domwires/devkit/common/Types";
import {ServerConfigIds} from "../src/com/domwires/devkit/server/ServerConfigIds";
import * as dotenv from "dotenv";

describe('ServerMainContextTest', function (this: Suite)
{
    dotenv.config();

    let mainContext: IServerMainContext;

    const factoriesConfig: FactoriesConfig = {
        serviceFactory: new Map([
            [Types.ISocketServerService, {implementation: Types.SioSocketServerService}]
        ]),
        modelFactory: new Map([
            [ConfigIds.netHost, {value: "127.0.0.1"}],
            [ConfigIds.httpPort, {value: 3123}],
            [ConfigIds.socketPort, {value: 3124}],
            [ServerConfigIds.dbName, {value: "devkit_db"}],
            [ServerConfigIds.dbHost, {value: "127.0.0.1"}],
            [ServerConfigIds.dbPort, {value: 27017}],
            [ServerConfigIds.emailHost, {value: process.env.EMAIL_HOST ? process.env.EMAIL_HOST : ""}],
            [ServerConfigIds.emailPort, {value: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT!) : 0}],
            [ServerConfigIds.emailAuthUser, {value: process.env.EMAIL_USER ? process.env.EMAIL_USER : ""}],
            [ServerConfigIds.emailAuthPassword, {value: process.env.EMAIL_PASSWORD ? process.env.EMAIl_PASSWORD : ""}]
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
        const f = new Factory(new Logger(LogLevel.VERBOSE));
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