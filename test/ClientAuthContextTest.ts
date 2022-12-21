/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import "../src/com/domwires/devkit/server/ServerRefs";

import "../src/com/domwires/devkit/client/auth/context/IClientAuthContext";
import "../src/com/domwires/devkit/common/main/model/IAccountModelContainer";
import "../src/com/domwires/devkit/server/main/context/IServerMainContext";

import {Suite} from "mocha";
import {expect} from "chai";
import {ContextConfig, Factory, ILogger, Logger, LogLevel} from "domwires";
import {Types} from "../src/com/domwires/devkit/common/Types";
import {
    AppContextConfigBuilder,
    AppContextMessageType,
    FactoriesConfig
} from "../src/com/domwires/devkit/common/app/context/IAppContext";
import {IAccountModelContainer} from "../src/com/domwires/devkit/common/main/model/IAccountModelContainer";
import {
    INetClientService,
    NetClientServiceConfig,
    NetClientServiceMessageType
} from "../src/com/domwires/devkit/client/common/service/net/INetClientService";
import {IServerMainContext} from "../src/com/domwires/devkit/server/main/context/IServerMainContext";
import {IClientAuthContext} from "../src/com/domwires/devkit/client/auth/context/IClientAuthContext";
import {
    AxiosSioNetClientService
} from "../src/com/domwires/devkit/client/common/service/net/impl/AxiosSioNetClientService";
import {ConfigIds} from "../src/com/domwires/devkit/common/ConfigIds";
import {ServerConfigIds} from "../src/com/domwires/devkit/server/ServerConfigIds";
import {printMappedToAliasCommandsToConsole} from "../src/com/domwires/devkit/common/Global";
import {UIMediatorMessageType} from "../src/com/domwires/devkit/common/app/mediator/IUIMediator";
import {IAccountModel} from "../src/com/domwires/devkit/common/main/model/IAccountModel";
import {ResultDto} from "../src/com/domwires/devkit/common/net/Dto";
import {ErrorReason} from "../src/com/domwires/devkit/common/ErrorReason";
import {SnapshotModelMessageType} from "../src/com/domwires/devkit/common/main/model/ISnapshotModel";
import * as dotenv from "dotenv";
import {
    DataBaseErrorReason,
    DataBaseServiceConfig,
    DataBaseServiceMessageType,
    IDataBaseService
} from "../src/com/domwires/devkit/server/common/service/net/db/IDataBaseService";
import {NetServerServiceMessageType} from "../src/com/domwires/devkit/server/common/service/net/INetServerService";
import {Collection} from "../src/com/domwires/devkit/server/common/Collection";
import {MongoDataBaseService} from "../src/com/domwires/devkit/server/common/service/net/db/impl/MongoDataBaseService";

describe('ClientAuthContextTest', function (this: Suite)
{
    dotenv.config();

    const logger: ILogger = new Logger(LogLevel.VERBOSE);

    let server: IServerMainContext;

    function createServer(done: () => void): void
    {
        const ff = new Factory(new Logger(LogLevel.VERBOSE));
        const dbConfig: DataBaseServiceConfig = {
            host: "127.0.0.1",
            port: 27017,
            dataBaseName: "client_auth_contest_test_db"
        };

        ff.mapToValue(Types.ServiceConfig, dbConfig);

        const db = ff.getInstance<IDataBaseService>(MongoDataBaseService);

        db.addMessageListener(NetServerServiceMessageType.OPEN_SUCCESS, () =>
        {
            const dropAccounts = () =>
            {
                const dropTokens = () =>
                {
                    const factoriesConfig: FactoriesConfig = {
                        serviceFactory: new Map([
                            [Types.IHttpServerService, {implementation: Types.ExpressHttpServerService}],
                            [Types.ISocketServerService, {implementation: Types.SioSocketServerService}],
                            [Types.IAuthDataBaseService, {implementation: Types.AuthMongoDataBaseService}],
                            [Types.IEmailService, {implementation: Types.NodemailerEmailService}],

                            [ConfigIds.netHost, {value: "127.0.0.1"}],
                            [ConfigIds.httpPort, {value: 3123}],
                            [ConfigIds.socketPort, {value: 3124}],
                            [ServerConfigIds.dbName, {value: "client_auth_contest_test_db"}],
                            [ServerConfigIds.dbHost, {value: "127.0.0.1"}],
                            [ServerConfigIds.dbPort, {value: 27017}],
                            [ServerConfigIds.emailHost, {value: process.env.EMAIL_HOST ? process.env.EMAIL_HOST : ""}],
                            [ServerConfigIds.emailPort, {value: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT!) : 0}],
                            [ServerConfigIds.emailAuthUser, {value: process.env.EMAIL_USER ? process.env.EMAIL_USER : ""}],
                            [ServerConfigIds.emailAuthPassword, {value: process.env.EMAIL_PASSWORD ? process.env.EMAIl_PASSWORD : ""}]
                        ])
                    };

                    const f = new Factory(new Logger(LogLevel.VERBOSE));
                    f.mapToValue(Types.IFactory, f);
                    f.mapToValue(Types.FactoriesConfig, factoriesConfig);
                    server = f.getInstance<IServerMainContext>(Types.IServerMainContext);
                    server.addMessageListener(AppContextMessageType.READY, message =>
                    {
                        if (message && message.initialTarget == server)
                        {
                            done();
                        }
                    });
                };

                db.addMessageListener(DataBaseServiceMessageType.DROP_COLLECTION_FAIL, dropTokens, true);
                db.addMessageListener(DataBaseServiceMessageType.DROP_COLLECTION_SUCCESS, dropTokens, true);

                db.dropCollection(Collection.TOKENS.name);
            };

            db.addMessageListener(DataBaseServiceMessageType.DROP_COLLECTION_FAIL, dropAccounts, true);
            db.addMessageListener(DataBaseServiceMessageType.DROP_COLLECTION_SUCCESS, dropAccounts, true);

            db.dropCollection(Collection.ACCOUNTS.name);
        });

        db.init();
    }

    let netClient: INetClientService;
    let context: IClientAuthContext;

    let accounts: IAccountModelContainer;
    let account: IAccountModel;

    beforeEach((done) =>
    {
        createServer(() =>
        {
            const f = new Factory(new Logger(LogLevel.VERBOSE));
            f.mapToValue(Types.IFactory, f);

            account = f.getInstance(Types.IAccountModel);
            f.mapToValue(Types.IAccountModel, account);

            accounts = f.getInstance(Types.IAccountModelContainer);
            f.mapToValue(Types.IAccountModelContainer, accounts);

            const cb: AppContextConfigBuilder = new AppContextConfigBuilder();
            cb.defaultCliUI = true;

            const config = cb.build();

            f.mapToValue<ContextConfig>(Types.ContextConfig, config);

            f.mapToType<INetClientService>(Types.INetClientService, AxiosSioNetClientService);

            const netClientConfig: NetClientServiceConfig = {
                httpBaseUrl: "http://127.0.0.1/:3123",
                socketUri: "ws://127.0.0.1:3124"
            };

            f.mapToValue(Types.ServiceConfig, netClientConfig);

            netClient = f.getInstance<INetClientService>(Types.INetClientService);
            f.mapToValue(Types.INetClientService, netClient);

            netClient.addMessageListener(NetClientServiceMessageType.CONNECTED, () =>
            {
                try
                {
                    context = f.getInstance(Types.IClientAuthContext);
                } catch (e)
                {
                    logger.error(e);
                }

                context.addMessageListener(AppContextMessageType.READY, message =>
                {
                    if (message && message.initialTarget == context)
                    {
                        // timeout to avoid bubbling event issue
                        register(() => done(), false);
                    }
                }, true);

                context.addModel(netClient);
            }, true);

            netClient.init();
            netClient.connect();
        });
    });

    afterEach((done) =>
    {
        const disposeServer = () =>
        {
            server.addMessageListener(AppContextMessageType.DISPOSED, message =>
            {
                if (message && message.initialTarget == server)
                {
                    done();
                }
            });
            server.dispose();
        };

        netClient.addMessageListener(NetClientServiceMessageType.DISCONNECTED, () =>
        {
            disposeServer();
        });

        if (netClient.isConnected)
        {
            netClient.disconnect();
        }
        else
        {
            disposeServer();
        }
    });

    it('testServicesReady', () =>
    {
        expect(netClient.isConnected).equals(true);
    });

    it('testRegisterSuccess', (done) =>
    {
        register(() =>
        {
            try
            {
                expect(account.email).includes("anton@javelin.ee");
                expect(account.nick).equals("Anton");
                expect(account.password).undefined;

                expect(netClient.getResponseData<{ result: ResultDto }>().data.result.success).true;

                done();
            } catch (e)
            {
                logger.error(e);
                throw e;
            }
        });
    });

    it('testRegisterFailExist', (done) =>
    {
        register(() =>
        {
            try
            {
                expect(account.email).undefined;
                expect(account.nick).undefined;
                expect(account.password).undefined;

                expect(netClient.getResponseData<{ result: ResultDto }>().data.result.success).false;
                expect(netClient.getResponseData<{ result: ResultDto }>().data.result.reason).equals(DataBaseErrorReason.DUPLICATE.name);

                done();
            } catch (e)
            {
                logger.error(e);
                throw e;
            }
        }, false);
    });

    it('testLoginSuccess', (done) =>
    {
        login(() =>
        {
            try
            {
                expect(account.email).equals("anton@javelin.ee");
                expect(account.nick).equals("Anton");
                expect(account.password).undefined;
                expect(account.isGuest).false;
                expect(account.isLoggedIn).true;

                expect(netClient.getResponseData<{ result: ResultDto }>().data.result.success).true;

                done();
            } catch (e)
            {
                logger.error(e);
                throw e;
            }
        });
    });

    it('testLoginFailNotExist', (done) =>
    {
        login(() =>
        {
            try
            {
                expect(netClient.getResponseData<{ result: ResultDto }>().data.result.success).false;
                expect(netClient.getResponseData<{ result: ResultDto }>().data.result.reason).equals(ErrorReason.NOT_FOUND.name);

                done();
            } catch (e)
            {
                logger.error(e);
                throw e;
            }
        }, false);
    });

    it('testLoginFailWrongPass', (done) =>
    {
        login(() =>
        {
            try
            {
                expect(netClient.getResponseData<{ result: ResultDto }>().data.result.success).false;
                expect(netClient.getResponseData<{ result: ResultDto }>().data.result.reason).equals(ErrorReason.WRONG_PASSWORD.name);

                done();
            } catch (e)
            {
                logger.error(e);
                throw e;
            }
        }, true, true);
    });

    it('testGuestLoginSuccess', (done) =>
    {
        guestLogin(() =>
        {
            try
            {
                expect(account.email).equals("guest_1");
                expect(account.nick).equals("guest_1");
                expect(account.password).undefined;
                expect(account.isGuest).true;
                expect(account.isLoggedIn).true;

                expect(netClient.getResponseData<{ result: ResultDto }>().data.result.success).true;

                done();
            } catch (e)
            {
                logger.error(e);
                throw e;
            }
        });
    });

    it('testLogoutCommand', (done) =>
    {
        logout(() =>
        {
            done();
        });
    });

    it('testResetPasswordSuccess', (done) =>
    {
        resetPassword(() =>
        {
            try
            {
                expect(netClient.getResponseData<{ result: ResultDto }>().data.result.success).true;

                done();
            } catch (e)
            {
                logger.error(e);
                throw e;
            }
        });
    });

    it('testResetPasswordFailNotFound', (done) =>
    {
        resetPassword(() =>
        {
            try
            {
                const data = netClient.getResponseData<{ result: ResultDto }>().data;

                expect(data.result.success).false;
                expect(data.result.reason).equals(DataBaseErrorReason.NOT_FOUND.name);

                done();
            } catch (e)
            {
                logger.error(e);
                throw e;
            }
        }, true);
    });

    it('testUpdatePasswordSuccess', (done) =>
    {
        login(() =>
        {
            updatePassword(() =>
            {
                try
                {
                    expect(netClient.getResponseData<{ result: ResultDto }>().data.result.success).true;

                    done();
                } catch (e)
                {
                    logger.error(e);
                    throw e;
                }
            });
        });
    });

    it('testUpdatePasswordFailUnAuth', (done) =>
    {
        updatePassword(() =>
        {
            try
            {
                const data = netClient.getResponseData<{ result: ResultDto }>().data;

                expect(data.result.success).false;
                expect(data.result.reason).equals(ErrorReason.UNAUTHORIZED.name);

                done();
            } catch (e)
            {
                logger.error(e);
                throw e;
            }
        });
    });

    it('testUpdatePasswordFailNoMatch', (done) =>
    {
        login(() =>
        {
            updatePassword(() =>
            {
                try
                {
                    const data = netClient.getResponseData<{ result: ResultDto }>().data;

                    expect(data.result.success).false;
                    expect(data.result.reason).equals(ErrorReason.OLD_PASSWORD_NO_MATCH.name);

                    done();
                } catch (e)
                {
                    logger.error(e);
                    throw e;
                }
            }, true);
        });
    });

    it('testUpdateEmailSuccess', (done) =>
    {
        login(() =>
        {
            updateEmail(() =>
            {
                try
                {
                    expect(netClient.getResponseData<{ result: ResultDto }>().data.result.success).true;

                    done();
                } catch (e)
                {
                    logger.error(e);
                    throw e;
                }
            });
        });
    });

    it('testUpdateEmailFailUnAuth', (done) =>
    {
        updateEmail(() =>
        {
            try
            {
                const data = netClient.getResponseData<{ result: ResultDto }>().data;

                expect(data.result.success).false;
                expect(data.result.reason).equals(ErrorReason.UNAUTHORIZED.name);

                done();
            } catch (e)
            {
                logger.error(e);
                throw e;
            }
        });
    });

    it('testUpdateEmailFailExists', (done) =>
    {
        login(() =>
        {
            updateEmail(() =>
            {
                try
                {
                    const data = netClient.getResponseData<{ result: ResultDto }>().data;

                    expect(data.result.success).false;
                    expect(data.result.reason).equals(ErrorReason.EMAIL_EXISTS.name);

                    done();
                } catch (e)
                {
                    logger.error(e);
                    throw e;
                }
            }, true);
        });
    });

    it('testUpdateAccountDataFailUnAuth', (done) =>
    {
        updateAccountData(() =>
        {
            try
            {
                const data = netClient.getResponseData<{ result: ResultDto }>().data;

                expect(data.result.success).false;
                expect(data.result.reason).equals(ErrorReason.UNAUTHORIZED.name);

                done();
            } catch (e)
            {
                logger.error(e);
                throw e;
            }
        });
    });

    it('testUpdateAccountDataSuccess', (done) =>
    {
        login(() =>
        {
            updateAccountData(() =>
            {
                try
                {
                    expect(netClient.getResponseData<{ result: ResultDto }>().data.result.success).true;

                    done();
                } catch (e)
                {
                    logger.error(e);
                    throw e;
                }
            });
        });
    });

    it('testDeleteAccountSuccess', (done) =>
    {
        login(() =>
        {
            deleteAccount(() =>
            {
                try
                {
                    expect(netClient.getResponseData<{ result: ResultDto }>().data.result.success).true;

                    done();
                } catch (e)
                {
                    logger.error(e);
                    throw e;
                }
            });
        });
    });

    it('testDeleteAccountFailUnAuth', (done) =>
    {
        deleteAccount(() =>
        {
            try
            {
                const data = netClient.getResponseData<{ result: ResultDto }>().data;

                expect(data.result.success).false;
                expect(data.result.reason).equals(ErrorReason.UNAUTHORIZED.name);

                done();
            } catch (e)
            {
                logger.error(e);
                throw e;
            }
        });
    });

    function register(done: () => void, newUser = true): void
    {
        cmd("register", {
            email: (newUser ? Date.now() + "_" : "") + "anton@javelin.ee",
            password: "123qweASD",
            nick: "Anton"
        });

        account.addMessageListener(SnapshotModelMessageType.SNAPSHOT_VALUES_UPDATED, () =>
        {
            done();
        }, true);
    }

    function login(done: () => void, existedUser = true, wrongPass = false): void
    {
        cmd("login", {
            email: existedUser ? "anton@javelin.ee" : "asdasd@asd.asd",
            password: !wrongPass ? "123qweASD" : "asdasd345435"
        });

        account.addMessageListener(SnapshotModelMessageType.SNAPSHOT_VALUES_UPDATED, () =>
        {
            done();
        }, true);
    }

    function resetPassword(done: () => void, wrongEmail = false): void
    {
        cmd("reset_password", {
            email: !wrongEmail ? "anton@javelin.ee" : "asdasd@asd.asd"
        });

        netClient.addMessageListener(NetClientServiceMessageType.TCP_RESPONSE, () =>
        {
            done();
        }, true);
    }

    function updatePassword(done: () => void, fail = false): void
    {
        cmd("update_password", {
            oldPassword: fail ? "123123123sadsfF" : "123qweASD",
            newPassword: "123ZXCdsa"
        });

        netClient.addMessageListener(NetClientServiceMessageType.TCP_RESPONSE, () =>
        {
            done();
        }, true);
    }

    function updateEmail(done: () => void, fail = false): void
    {
        cmd("update_email", {
            email: fail ? "anton@javelin.ee" : "anton.nefjodov@gmail.com"
        });

        netClient.addMessageListener(NetClientServiceMessageType.TCP_RESPONSE, () =>
        {
            done();
        }, true);
    }

    function updateAccountData(done: () => void): void
    {
        cmd("update_account_data", {
            nick: "Huju"
        });

        netClient.addMessageListener(NetClientServiceMessageType.TCP_RESPONSE, () =>
        {
            done();
        }, true);
    }

    function deleteAccount(done: () => void): void
    {
        cmd("delete_account");

        netClient.addMessageListener(NetClientServiceMessageType.TCP_RESPONSE, () =>
        {
            done();
        }, true);
    }

    function guestLogin(done: () => void): void
    {
        cmd("guest_login");

        account.addMessageListener(SnapshotModelMessageType.SNAPSHOT_VALUES_UPDATED, () =>
        {
            done();
        }, true);
    }

    function logout(done: () => void): void
    {
        cmd("logout");

        netClient.addMessageListener(NetClientServiceMessageType.DISCONNECTED, () =>
        {
            done();
        }, true);
    }

    function cmd(name: string, data?: Record<string, unknown>): void
    {
        printMappedToAliasCommandsToConsole();

        context.tryToExecuteCommand(UIMediatorMessageType.INPUT,
            data ? {value: "/cmd:auth:" + name + ":" + JSON.stringify(data)} :
                {value: "/cmd:auth:" + name}
        );
    }

});