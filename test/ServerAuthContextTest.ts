/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import "reflect-metadata";

import "../src/com/domwires/devkit/server/auth/context/IServerAuthContext";
import "../src/com/domwires/devkit/common/main/model/IAccountModelContainer";

import {Suite} from "mocha";
import {expect} from "chai";
import {IHttpServerService} from "../src/com/domwires/devkit/server/common/service/net/http/IHttpServerService";
import {
    ExpressHttpServerService
} from "../src/com/domwires/devkit/server/common/service/net/http/impl/ExpressHttpServerService";
import {
    ISocketServerService,
    SocketServerServiceConfig
} from "../src/com/domwires/devkit/server/common/service/net/socket/ISocketServerService";
import {
    SioSocketServerService
} from "../src/com/domwires/devkit/server/common/service/net/socket/impl/SioSocketServerService";
import {ContextConfig, Enum, Factory, ILogger, Logger, LogLevel} from "domwires";
import {
    NetServerServiceConfig,
    NetServerServiceMessageType
} from "../src/com/domwires/devkit/server/common/service/net/INetServerService";
import {io, Socket} from "socket.io-client";
import {SocketAction} from "../src/com/domwires/devkit/common/net/SocketAction";
import {Types} from "../src/com/domwires/devkit/common/Types";
import {
    DataBaseErrorReason,
    DataBaseServiceConfig,
    DataBaseServiceMessageType
} from "../src/com/domwires/devkit/server/common/service/net/db/IDataBaseService";
import {
    AppContextConfigBuilder,
    AppContextMessageType
} from "../src/com/domwires/devkit/common/app/context/IAppContext";
import {AccountDto, LoginDto, ResultDto} from "../src/com/domwires/devkit/common/net/Dto";
import {UIMediatorMessageType} from "../src/com/domwires/devkit/common/app/mediator/IUIMediator";
import {Collection} from "../src/com/domwires/devkit/server/common/Collection";
import {ErrorReason} from "../src/com/domwires/devkit/common/ErrorReason";
import {printMappedToAliasCommandsToConsole} from "../src/com/domwires/devkit/common/Global";
import {IAccountModelContainer} from "../src/com/domwires/devkit/common/main/model/IAccountModelContainer";
import {IServerAuthContext} from "../src/com/domwires/devkit/server/auth/context/IServerAuthContext";
import {
    EmailServiceConfig,
    IEmailService
} from "../src/com/domwires/devkit/server/common/service/net/email/IEmailService";
import {
    NodemailerEmailService
} from "../src/com/domwires/devkit/server/common/service/net/email/impl/NodemailerEmailService";
import * as dotenv from "dotenv";
import {ServiceMessageType} from "../src/com/domwires/devkit/common/service/IService";
import Http from "http";
import {Utils} from "../src/com/domwires/devkit/common/utils/Utils";
import {IAuthDataBaseService} from "../src/com/domwires/devkit/server/common/service/net/db/IAuthDataBaseService";
import {
    AuthMongoDataBaseService
} from "../src/com/domwires/devkit/server/common/service/net/db/impl/AuthMongoDataBaseService";

describe('ServerAuthContextTest', function (this: Suite)
{
    dotenv.config();

    const logger: ILogger = new Logger(LogLevel.VERBOSE);

    let http: IHttpServerService;
    let socket: ISocketServerService;
    let db: IAuthDataBaseService;
    let email: IEmailService;

    let context: IServerAuthContext;

    let client: Socket;
    let clientId: string;

    let accounts: IAccountModelContainer;

    beforeEach((done) =>
    {
        const f = new Factory(new Logger(LogLevel.VERBOSE));
        f.mapToValue(Types.IFactory, f);

        accounts = f.getInstance(Types.IAccountModelContainer);

        const cb: AppContextConfigBuilder = new AppContextConfigBuilder();
        cb.defaultCliUI = true;

        const config = cb.build();

        f.mapToValue<ContextConfig>(Types.ContextConfig, config);

        f.mapToType<IHttpServerService>(Types.IHttpServerService, ExpressHttpServerService);
        f.mapToType<ISocketServerService>(Types.ISocketServerService, SioSocketServerService);
        f.mapToType<IAuthDataBaseService>(Types.IAuthDataBaseService, AuthMongoDataBaseService);
        f.mapToType<IEmailService>(Types.IEmailService, NodemailerEmailService);

        const httpConfig: NetServerServiceConfig = {enabled: true, host: "127.0.0.1", port: 3001};

        f.mapToValue(Types.ServiceConfig, httpConfig);

        http = f.getInstance<IHttpServerService>(Types.IHttpServerService);
        f.mapToValue(Types.IHttpServerService, http);

        http.addMessageListener(NetServerServiceMessageType.OPEN_SUCCESS, () =>
        {
            const socketConfig: SocketServerServiceConfig = {
                enabled: http.enabled,
                host: http.host,
                port: 3002,
                http: http.nodeHttpServer
            };

            f.mapToValue(Types.ServiceConfig, socketConfig);

            socket = f.getInstance<ISocketServerService>(Types.ISocketServerService);
            f.mapToValue(Types.ISocketServerService, socket);

            socket.addMessageListener(NetServerServiceMessageType.OPEN_SUCCESS, () =>
            {
                f.mapToValue(Types.IAccountModelContainer, accounts);

                const dbConfig: DataBaseServiceConfig = {
                    host: "127.0.0.1",
                    port: 27017,
                    dataBaseName: "server_auth_context_test_db"
                };

                f.mapToValue(Types.ServiceConfig, dbConfig);

                db = f.getInstance(Types.IAuthDataBaseService);
                f.mapToValue(Types.IAuthDataBaseService, db);

                db.addMessageListener(NetServerServiceMessageType.OPEN_SUCCESS, () =>
                {
                    const dropAccounts = () =>
                    {
                        const dropTokens = () =>
                        {
                            const emailConfig: EmailServiceConfig = {
                                host: process.env.EMAIL_HOST!,
                                port: parseInt(process.env.EMAIL_PORT!),
                                authUser: process.env.EMAIL_USER!,
                                authPassword: process.env.EMAIL_PASSWORD ? process.env.EMAIl_PASSWORD! : ""
                            };

                            f.mapToValue(Types.ServiceConfig, emailConfig);

                            email = f.getInstance(Types.IEmailService);
                            f.mapToValue(Types.IEmailService, email);

                            const emailReady = () =>
                            {
                                context = f.getInstance(Types.IServerAuthContext);
                                context.addMessageListener(AppContextMessageType.READY, () =>
                                {
                                    done();
                                });

                                context.addModel(http);
                                context.addModel(socket);
                                context.addModel(db);
                                context.addModel(email);
                            };

                            email.addMessageListener(ServiceMessageType.INIT_SUCCESS, emailReady, true);
                            email.addMessageListener(ServiceMessageType.INIT_FAIL, emailReady, true);

                            email.init();
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
            });

            socket.init();
        });

        http.init();
    });

    afterEach((done) =>
    {
        if (client) client.disconnect();

        socket.addMessageListener(NetServerServiceMessageType.CLOSE_SUCCESS, () =>
        {
            http.addMessageListener(NetServerServiceMessageType.CLOSE_SUCCESS, () =>
            {
                db.addMessageListener(NetServerServiceMessageType.CLOSE_SUCCESS, () =>
                {
                    context.dispose();

                    done();
                });

                db.close();
            });
            http.close();
        });

        socket.close();
    });

    it('testServicesReady', () =>
    {
        expect(http.isOpened).equals(true);
        expect(socket.isOpened).equals(true);
        expect(db.isOpened).equals(true);
        expect(http.port).equals(3001);
        expect(http.host).equals("127.0.0.1");
        expect(socket.port).equals(3002);
        expect(socket.host).equals(http.host);
    });

    it('testLoginSuccess', (done) =>
    {
        insert().then(() =>
        {
            login(json =>
            {
                try
                {
                    expect(json.action).equals(SocketAction.LOGIN.name);
                    expect(json.data.result.success).true;
                    expect(json.data.result.reason).undefined;
                    expect(json.data.data?.nick).equals("Anton");
                    expect(json.data.data?.email).equals("anton@javelin.ee");

                    expect(accounts.getImmutable(client.id)?.nick).equals("Anton");
                    expect(accounts.getImmutable(client.id)?.isLoggedIn).true;
                    expect(accounts.getImmutable(client.id)?.isGuest).false;
                    expect(accounts.getImmutable(client.id)?.id).not.undefined;
                } catch (e)
                {
                    logger.error(e);
                    throw e;
                }

                done();
            });
        });
    });

    it('testUpdatePasswordSuccess', (done) =>
    {
        insert().then(() =>
        {
            const c = io("ws://127.0.0.1:3002");

            c.on("connect", () =>
            {
                c.emit("data", {
                    action: SocketAction.LOGIN.name,
                    data: {email: "anton@javelin.ee", password: "123qweASD"}
                });
            });

            let attempt = 0;
            const oldPass = "123qweASD";

            c.on("data", json =>
            {
                if (attempt === 0)
                {
                    attempt++;

                    try
                    {
                        expect(json.action).equals(SocketAction.LOGIN.name);
                        expect(json.data.result.success).true;
                        expect(json.data.result.reason).undefined;

                        c.emit("data", {
                            action: SocketAction.UPDATE_PASSWORD.name,
                            data: {oldPassword: "123qweASD", newPassword: "123qweASDzxc"}
                        });
                    } catch (e)
                    {
                        logger.error(e);
                        throw e;
                    }
                }
                else
                {
                    try
                    {
                        expect(json.action).equals(SocketAction.UPDATE_PASSWORD.name);
                        expect(json.data.result.success).true;
                        expect(json.data.result.reason).undefined;

                        expect(accounts.get(c.id)!.password).not.equals(Utils.hashPassword(oldPass));

                        c.disconnect();
                        done();
                    } catch (e)
                    {
                        logger.error(e);
                        throw e;
                    }
                }
            });
        });
    });

    it('testUpdatePasswordFailNoMatch', (done) =>
    {
        insert().then(() =>
        {
            const c = io("ws://127.0.0.1:3002");

            c.on("connect", () =>
            {
                c.emit("data", {
                    action: SocketAction.LOGIN.name,
                    data: {email: "anton@javelin.ee", password: "123qweASD"}
                });
            });

            let attempt = 0;

            c.on("data", json =>
            {
                if (attempt === 0)
                {
                    attempt++;

                    try
                    {
                        expect(json.action).equals(SocketAction.LOGIN.name);
                        expect(json.data.result.success).true;
                        expect(json.data.result.reason).undefined;

                        c.emit("data", {
                            action: SocketAction.UPDATE_PASSWORD.name,
                            data: {oldPassword: "123qweASD123", newPassword: "123qweASDzxc"}
                        });
                    } catch (e)
                    {
                        logger.error(e);
                        throw e;
                    }
                }
                else
                {
                    try
                    {
                        expect(json.action).equals(SocketAction.UPDATE_PASSWORD.name);
                        expect(json.data.result.success).false;
                        expect(json.data.result.reason).equals(ErrorReason.OLD_PASSWORD_NO_MATCH.name);

                        c.disconnect();
                        done();
                    } catch (e)
                    {
                        logger.error(e);
                        throw e;
                    }
                }
            });
        });
    });

    it('testUpdateAccountDataSuccess', (done) =>
    {
        insert().then(() =>
        {
            const c = io("ws://127.0.0.1:3002");

            c.on("connect", () =>
            {
                c.emit("data", {
                    action: SocketAction.LOGIN.name,
                    data: {email: "anton@javelin.ee", password: "123qweASD"}
                });
            });

            let attempt = 0;

            c.on("data", json =>
            {
                if (attempt === 0)
                {
                    attempt++;

                    try
                    {
                        expect(json.action).equals(SocketAction.LOGIN.name);
                        expect(json.data.result.success).true;
                        expect(json.data.result.reason).undefined;

                        c.emit("data", {
                            action: SocketAction.UPDATE_ACCOUNT_DATA.name,
                            data: {nick: "Ololosha"}
                        });
                    } catch (e)
                    {
                        logger.error(e);
                        throw e;
                    }
                }
                else
                {
                    try
                    {
                        expect(json.action).equals(SocketAction.UPDATE_ACCOUNT_DATA.name);
                        expect(json.data.result.success).true;

                        expect(accounts.get(c.id)!.nick).equals("Ololosha");

                        c.disconnect();
                        done();
                    } catch (e)
                    {
                        logger.error(e);
                        throw e;
                    }
                }
            });
        });
    });

    it('testLoginFailNoUser', (done) =>
    {
        insert().then(() =>
        {
            login(json =>
            {
                try
                {
                    expect(json.action).equals(SocketAction.LOGIN.name);
                    expect(json.data.result.success).false;
                    expect(json.data.result.reason).equals(ErrorReason.NOT_FOUND.name);

                    done();
                } catch (e)
                {
                    logger.error(e);
                    throw e;
                }
            }, {email: "no@user.com", password: "123123ASDASDasd"});
        });
    });

    it('testLoginFailNoUserAndLoginSuccess', (done) =>
    {
        insert().then(() =>
        {
            let attempt = 0;

            const c = io("ws://127.0.0.1:3002");

            c.on("connect", () =>
            {
                c.emit("data", {
                    action: SocketAction.LOGIN.name,
                    data: {email: "nonono@user.com", password: "123asdCXZ"}
                });
            });

            c.on("data", json =>
            {
                if (attempt === 0)
                {
                    attempt++;

                    expect(json.action).equals(SocketAction.LOGIN.name);
                    expect(json.data.result.success).false;
                    expect(json.data.result.reason).equals(ErrorReason.NOT_FOUND.name);

                    c.emit("data", {
                        action: SocketAction.LOGIN.name,
                        data: {email: "anton@javelin.ee", password: "123qweASD"}
                    });
                }
                else
                {
                    expect(json.action).equals(SocketAction.LOGIN.name);
                    expect(json.data.result.success).true;
                    expect(json.data.result.reason).undefined;

                    c.disconnect();
                    done();
                }
            });
        });
    });

    it('testLoginFailWrongPass', (done) =>
    {
        insert().then(() =>
        {
            login(json =>
            {
                try
                {
                    expect(json.action).equals(SocketAction.LOGIN.name);
                    expect(json.data.result.success).false;
                    expect(json.data.result.reason).equals(ErrorReason.WRONG_PASSWORD.name);

                    done();
                } catch (e)
                {
                    logger.error(e);
                    throw e;
                }
            }, {email: "anton@javelin.ee", password: "ololo123"});
        });
    });

    it('testLoginViaCmd', (done) =>
    {
        insert().then(() =>
        {
            login(json =>
            {
                try
                {
                    expect(json.action).equals(SocketAction.LOGIN.name);
                    expect(json.data.result.success).true;
                    expect(json.data.result.reason).undefined;
                } catch (e)
                {
                    logger.error(e);
                    throw e;
                }

                done();
            }, undefined, true);
        });
    });

    it('testRegisterSuccess', (done) =>
    {
        register(json =>
        {
            try
            {
                expect(json.action).equals(SocketAction.REGISTER.name);
                expect(json.data.result.success).true;
                expect(json.data.result.reason).undefined;

                done();
            } catch (e)
            {
                logger.error(e);
                throw e;
            }
        });
    });

    it('testRegisterFailExists', (done) =>
    {
        insert().then(() =>
        {
            register(json =>
            {
                try
                {
                    expect(json.action).equals(SocketAction.REGISTER.name);
                    expect(json.data.result.success).false;
                    expect(json.data.result.reason).equals(DataBaseErrorReason.DUPLICATE.name);

                    done();
                } catch (e)
                {
                    logger.error(e);
                    throw e;
                }
            });
        });
    });

    it('testRegisterFailFieldMissing', (done) =>
    {
        register(json =>
        {
        }, false, {password: "123qweASD"}, () =>
        {
            try
            {
                expect(client.disconnected).true;
                done();
            } catch (e)
            {
                logger.error(e);
                throw e;
            }
        });
    });

    it('testRegisterFailEmailInvalid', (done) =>
    {
        register(json =>
        {
        }, false, {email: "puk", password: "123qweASD", nick: "olo"}, () =>
        {
            try
            {
                expect(client.disconnected).true;
                done();
            } catch (e)
            {
                logger.error(e);
                throw e;
            }
        });
    });

    it('testRegisterViaCmd', (done) =>
    {
        register(json =>
        {
            try
            {
                expect(json.action).equals(SocketAction.REGISTER.name);
                expect(json.data.result.success).true;
                expect(json.data.result.reason).undefined;

                done();
            } catch (e)
            {
                logger.error(e);
                throw e;
            }
        }, true);
    });

    it('testLogout', (done) =>
    {
        logout();

        client.on("disconnect", () =>
        {
            expect(accounts.getImmutable(clientId)).undefined;

            done();
        });
    });

    it('testLogoutViaCmd', (done) =>
    {
        logout(true);

        client.on("disconnect", () =>
        {
            try
            {
                expect(accounts.getImmutable(clientId)).undefined;
            } catch (e)
            {
                logger.error(e);
                throw e;
            }

            done();
        });
    });

    it('testGuestLogin', (done) =>
    {
        guestLogin(() =>
        {
            try
            {
                expect(accounts.getImmutable(clientId)?.isGuest).true;
                expect(accounts.getImmutable(clientId)?.isLoggedIn).true;

                done();
            } catch (e)
            {
                logger.error(e);
                throw e;
            }
        });
    });

    it('testGuestLoginViaCmd', (done) =>
    {
        guestLogin(() =>
        {
            try
            {
                expect(accounts.getImmutable(clientId)?.isGuest).true;
                expect(accounts.getImmutable(clientId)?.isLoggedIn).true;

                done();
            } catch (e)
            {
                logger.error(e);
                throw e;
            }
        }, true);
    });

    (process.env.EMAIL_PASSWORD ? it : it.skip)('testResetPasswordResetSuccess', (done) =>
    {
        register(() =>
        {
            resetPassword((json) =>
            {
                try
                {
                    expect(json.data.result.success).true;

                    setTimeout(() =>
                    {
                        clientRequest("http://127.0.0.1:3001/password-reset?token=" + json.data.data.tokenId, (data, code) =>
                        {
                            const response: { action: string; data: { result: ResultDto } } = JSON.parse(data);

                            expect(code).equals(200);
                            expect(response.data.result.success).true;

                            done();
                        });
                    }, 1000);
                } catch (e)
                {
                    logger.error(e);
                    throw e;
                }
            });
        });
    });

    (process.env.EMAIL_PASSWORD ? it : it.skip)('testResetPasswordResetFailTokenExpired', (done) =>
    {
        register(() =>
        {
            resetPassword((json) =>
            {
                try
                {
                    expect(json.data.result.success).true;

                    setTimeout(() =>
                    {
                        clientRequest("http://127.0.0.1:3001/password-reset?token=" + json.data.data.tokenId, (data, code) =>
                        {
                            const response: { action: string; data: { result: ResultDto } } = JSON.parse(data);

                            expect(code).equals(200);
                            expect(response.data.result.success).false;
                            expect(response.data.result.reason).equals(ErrorReason.TOKEN_EXPIRED.name);

                            done();
                        });
                    }, 1500);
                } catch (e)
                {
                    logger.error(e);
                    throw e;
                }
            });
        });
    });

    (process.env.EMAIL_PASSWORD ? it : it.skip)('testResetPasswordResetFailWrongTokenId', (done) =>
    {
        register(() =>
        {
            resetPassword((json) =>
            {
                try
                {
                    expect(json.data.result.success).true;

                    setTimeout(() =>
                    {
                        clientRequest("http://127.0.0.1:3001/password-reset?token=6348acd2e1a47ca32e79f46f", (data, code) =>
                        {
                            const response: { action: string; data: { result: ResultDto } } = JSON.parse(data);

                            expect(code).equals(200);
                            expect(response.data.result.success).false;
                            expect(response.data.result.reason).equals(ErrorReason.FAILED_TO_FIND_TOKEN.name);

                            done();
                        });
                    }, 1500);
                } catch (e)
                {
                    logger.error(e);
                    throw e;
                }
            });
        });
    });

    (process.env.EMAIL_PASSWORD ? it : it.skip)('testUpdateEmailSuccess', (done) =>
    {
        insert().then(() =>
        {
            const c = io("ws://127.0.0.1:3002");

            c.on("connect", () =>
            {
                c.emit("data", {
                    action: SocketAction.LOGIN.name,
                    data: {email: "anton@javelin.ee", password: "123qweASD"}
                });
            });

            let attempt = 0;

            c.on("data", json =>
            {
                if (attempt == 0)
                {
                    attempt++;

                    c.emit("data", {
                        action: SocketAction.UPDATE_EMAIL.name,
                        data: {email: "anton.nefjodov@gmail.com"}
                    });
                }
                else if (attempt == 1)
                {
                    attempt++;

                    try
                    {
                        expect(json.data.result.success).true;

                        setTimeout(() =>
                        {
                            clientRequest("http://127.0.0.1:3001/update-email?token=" + json.data.data.tokenId, (data, code) =>
                            {
                                const response: { action: string; data: { result: ResultDto } } = JSON.parse(data);

                                expect(code).equals(200);
                                expect(response.data.result.success).true;

                                c.disconnect();
                                done();
                            });
                        }, 1000);
                    } catch (e)
                    {
                        logger.error(e);
                        throw e;
                    }
                }
            });
        });
    });

    (process.env.EMAIL_PASSWORD ? it : it.skip)('testUpdateEmailFailExists', (done) =>
    {
        insert().then(() =>
        {
            const c = io("ws://127.0.0.1:3002");

            c.on("connect", () =>
            {
                c.emit("data", {
                    action: SocketAction.LOGIN.name,
                    data: {email: "anton@javelin.ee", password: "123qweASD"}
                });
            });

            let attempt = 0;

            c.on("data", json =>
            {
                if (attempt == 0)
                {
                    attempt++;

                    c.emit("data", {
                        action: SocketAction.UPDATE_EMAIL.name,
                        data: {email: "anton@javelin.ee"}
                    });
                }
                else if (attempt == 1)
                {
                    attempt++;

                    try
                    {
                        expect(json.data.result.success).false;
                        expect(json.data.result.reason).equals(ErrorReason.EMAIL_EXISTS.name);

                        c.disconnect();
                        done();
                    } catch (e)
                    {
                        logger.error(e);
                        throw e;
                    }
                }
            });
        });
    });

    (process.env.EMAIL_PASSWORD ? it : it.skip)('testDeleteAccountSuccess', (done) =>
    {
        insert().then(() =>
        {
            const c = io("ws://127.0.0.1:3002");

            c.on("connect", () =>
            {
                c.emit("data", {
                    action: SocketAction.LOGIN.name,
                    data: {email: "anton@javelin.ee", password: "123qweASD"}
                });
            });

            let attempt = 0;

            c.on("data", json =>
            {
                if (attempt == 0)
                {
                    attempt++;

                    c.emit("data", {
                        action: SocketAction.DELETE_ACCOUNT.name
                    });
                }
                else if (attempt == 1)
                {
                    attempt++;

                    try
                    {
                        expect(json.data.result.success).true;

                        setTimeout(() =>
                        {
                            clientRequest("http://127.0.0.1:3001/delete-account?token=" + json.data.data.tokenId, (data, code) =>
                            {
                                const response: { action: string; data: { result: ResultDto } } = JSON.parse(data);

                                expect(code).equals(200);
                                expect(response.data.result.success).true;

                                c.disconnect();
                                done();
                            });
                        }, 1000);
                    } catch (e)
                    {
                        logger.error(e);
                        throw e;
                    }
                }
            });
        });
    });

    function register(onComplete: (data: { action: string; data: { result: ResultDto; data?: AccountDto } }) => void, byCmd = false, dto?: any, onDisconnect?: () => void): void
    {
        const created = () =>
        {
            const regDto: AccountDto = !dto ? {email: "anton@javelin.ee", password: "123qweASD", nick: "Anton"} : dto;
            !byCmd ? send(SocketAction.REGISTER, regDto) : cmd("register", regDto, true);
        };

        if (!client || !client.connected)
        {
            createClient(created, json =>
            {
                onComplete(json);
            }, onDisconnect);
        }
    }

    function login(onComplete: (data: { action: string; data: { result: ResultDto; data?: AccountDto } }) => void,
                   dto?: LoginDto, byCmd = false, onDisconnect?: () => void): void
    {
        const created = () =>
        {
            const loginDto: LoginDto = {email: "anton@javelin.ee", password: "123qweASD"};
            const d = dto ? dto : loginDto;
            !byCmd ? send(SocketAction.LOGIN, d) : cmd("login", d, true);
        };

        if (!client || !client.connected)
        {
            createClient(created, json =>
            {
                onComplete(json);
            }, onDisconnect);
        }
    }

    function guestLogin(onComplete: (data: { action: string; data: ResultDto }) => void, byCmd = false): void
    {
        createClient(() =>
        {
            !byCmd ? send(SocketAction.GUEST_LOGIN) : cmd("guest_login", {
                isGuest: true,
                actionName: SocketAction.GUEST_LOGIN.name,
                success: true
            }, false);
        }, json =>
        {
            onComplete(json);
        });
    }

    function logout(byCmd = false): void
    {
        createClient(() =>
        {
            !byCmd ? send(SocketAction.LOGOUT) : cmd("logout");
        });
    }

    function resetPassword(onComplete: (data: { action: string; data: { result: ResultDto; data: { tokenId: string } } }) => void, byCmd = false): void
    {
        createClient(() =>
        {
            const dto: LoginDto = {email: "anton@javelin.ee"};
            !byCmd ? send(SocketAction.RESET_PASSWORD, dto) : cmd("reset_password", dto);
        }, json =>
        {
            onComplete(json);
        });
    }

    function cmd(name: string, data?: any, wrapInDto = true): void
    {
        printMappedToAliasCommandsToConsole();

        let dto;
        if (wrapInDto)
        {
            dto = data ? {data: data, requestFromClientId: client.id} : {
                requestFromClientId: client.id
            };
        }
        else
        {
            if (data)
            {
                data.requestFromClientId = client.id;
                dto = data;
            }
            else
            {
                dto = {requestFromClientId: client.id};
            }
        }
        context.tryToExecuteCommand(UIMediatorMessageType.INPUT,
            {value: "/cmd:auth:" + name + ":" + JSON.stringify(dto)}
        );
    }

    function send(action: Enum, data?: any): void
    {
        client.emit("data", {action: action.name, data: data});
    }

    function createClient(onConnect: () => void, onData?: (data: any) => void, onDisconnect?: () => void): void
    {
        if (client && client.connected)
        {
            client.disconnect();
        }

        client = io("ws://127.0.0.1:3002");

        client.on("connect", () =>
        {
            client.off("connect");

            clientId = client.id;
            onConnect();
        });

        if (onData)
        {
            client.on("data", data =>
            {
                onData(data);
            });
        }

        if (onDisconnect)
        {
            client.on("disconnect", () =>
            {
                client.off("disconnect");

                onDisconnect();
            });
        }
    }

    async function insert()
    {
        await db.insert(Collection.ACCOUNTS.name, [
            {
                email: "anton@javelin.ee",
                password: Utils.hashPassword("123qweASD"),
                nick: "Anton", gender: "male"
            }
        ]);
    }

    function clientRequest(url: string, callback?: (data: string, code?: number) => void, method?: string): void
    {
        const m = !method ? "GET" : method;

        logger.info("\nRequest:", url, "method:", m);

        Http.get(url, {method: m}, res =>
        {
            let data = "";
            res.on("data", (chunk: string) =>
            {
                data += chunk;
            });
            res.on("end", () =>
            {
                logger.info("\nResponse:", data, "\nCode:", res.statusCode);

                if (callback)
                {
                    callback(data, res.statusCode);
                }
            });
        }).end();
    }

});