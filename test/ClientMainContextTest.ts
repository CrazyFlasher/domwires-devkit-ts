/* eslint-disable @typescript-eslint/no-empty-function */

import "../src/com/domwires/devkit/server/ServerRefs";
import "../src/com/domwires/devkit/client/ClientRefs";

import {Suite} from "mocha";
import {IServerMainContext} from "../src/com/domwires/devkit/server/main/context/IServerMainContext";
import {AppContextMessageType, FactoriesConfig} from "../src/com/domwires/devkit/common/app/context/IAppContext";
import {ConfigIds} from "../src/com/domwires/devkit/common/ConfigIds";
import {ServerConfigIds} from "../src/com/domwires/devkit/server/ServerConfigIds";
import {Factory, Logger, LogLevel} from "domwires";
import {Types} from "../src/com/domwires/devkit/common/Types";
import {IClientMainContext} from "../src/com/domwires/devkit/client/main/context/IClientMainContext";
import {NetClientServiceMessageType} from "../src/com/domwires/devkit/client/common/service/net/INetClientService";
import * as dotenv from "dotenv";

describe('ClientMainContextTest', function (this: Suite)
{
    dotenv.config();

    let serverContext: IServerMainContext;

    let mainContext: IClientMainContext;

    const serverFactoriesConfig: FactoriesConfig = {
        serviceFactory: new Map([
            [Types.IHttpServerService, {implementation: Types.ExpressHttpServerService}],
            [Types.ISocketServerService, {implementation: Types.SioSocketServerService}],
            [Types.IAuthDataBaseService, {implementation: Types.AuthMongoDataBaseService}],
            [Types.IEmailService, {implementation: Types.NodemailerEmailService}],

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

    const clientFactoriesConfig: FactoriesConfig = {
        serviceFactory: new Map([
            [Types.INetClientService, {implementation: Types.AxiosSioNetClientService}],

            [ConfigIds.netHost, {value: "127.0.0.1"}],
            [ConfigIds.httpPort, {value: 3123}],
            [ConfigIds.socketPort, {value: 3124}]
        ])
    };

    beforeEach((done) =>
    {
        const f = new Factory(new Logger(LogLevel.VERBOSE));
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
        createContext(done);
    });

    it('testReconnect', (done) =>
    {
        let reconnectAttempts = 0;

        createContext(() =>
        {
            mainContext.addMessageListener(NetClientServiceMessageType.CONNECTED, message =>
            {
                if (message && message.initialTarget == mainContext.netClient)
                {
                    if (reconnectAttempts < 3)
                    {
                        reconnectAttempts++;

                        mainContext.netClient.disconnect();
                    } else
                    {
                        done();
                    }
                }
            });

            mainContext.netClient.disconnect();
        });
    });

    function createContext(done: () => void): void
    {
        const f = new Factory(new Logger(LogLevel.VERBOSE));
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
    }
});