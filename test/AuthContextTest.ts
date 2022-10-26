/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import "reflect-metadata";

import "../src/com/domwires/devkit/server/auth/context/IAuthContext";

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
import {IAccountModel} from "../src/com/domwires/devkit/common/model/IAccountModel";
import {
    SioSocketServerService
} from "../src/com/domwires/devkit/server/common/service/net/socket/impl/SioSocketServerService";
import {ContextConfig, Enum, Factory, Logger, LogLevel} from "domwires";
import {
    NetServerServiceConfig,
    NetServerServiceMessageType
} from "../src/com/domwires/devkit/server/common/service/net/INetServerService";
import {IAuthContext} from "../src/com/domwires/devkit/server/auth/context/IAuthContext";
import {io, Socket} from "socket.io-client";
import {SocketAction} from "../src/com/domwires/devkit/common/net/SocketAction";
import {Types} from "../src/com/domwires/devkit/common/Types";
import {
    DataBaseServiceConfig,
    DataBaseServiceMessageType,
    IDataBaseService
} from "../src/com/domwires/devkit/server/common/service/net/db/IDataBaseService";
import {MongoDataBaseService} from "../src/com/domwires/devkit/server/common/service/net/db/impl/MongoDataBaseService";
import {AppContextConfigBuilder, AppContextMessageType} from "../src/com/domwires/devkit/common/context/IAppContext";
import {LoginDto, RegisterDto} from "../src/com/domwires/devkit/common/net/dto/Dto";
import {Result} from "../src/com/domwires/devkit/common/net/Result";
import {UIMediatorMessageType} from "../src/com/domwires/devkit/common/mediator/IUIMediator";
import {Collection} from "../src/com/domwires/devkit/server/common/Collection";

describe('AuthContextTest', function (this: Suite)
{
    let http: IHttpServerService;
    let socket: ISocketServerService;
    let db: IDataBaseService;

    let context: IAuthContext;

    let client: Socket;

    beforeEach((done) =>
    {
        const f = new Factory(new Logger(LogLevel.INFO));
        f.mapToValue(Types.IFactory, f);

        const cb: AppContextConfigBuilder = new AppContextConfigBuilder();
        cb.defaultCliUI = true;

        const config = cb.build();

        f.mapToValue<ContextConfig>(Types.ContextConfig, config);

        f.mapToType<IHttpServerService>(Types.IHttpServerService, ExpressHttpServerService);
        f.mapToType<ISocketServerService>(Types.ISocketServerService, SioSocketServerService);
        f.mapToType<IDataBaseService>(Types.IDataBaseService, MongoDataBaseService);

        const httpConfig: NetServerServiceConfig = {enabled: true, host: "127.0.0.1", port: 3001};

        f.mapToValue(Types.ServiceConfig, httpConfig);

        http = f.getInstance<IHttpServerService>(Types.IHttpServerService);
        f.mapToValue(Types.IHttpServerService, http);

        http.addMessageListener(NetServerServiceMessageType.OPEN_SUCCESS, () =>
        {
            const socketConfig: SocketServerServiceConfig = {
                enabled: http.enabled,
                host: http.host,
                port: http.port,
                http: http.nodeHttpServer
            };

            f.mapToValue(Types.ServiceConfig, socketConfig);

            socket = f.getInstance<ISocketServerService>(Types.ISocketServerService);
            f.mapToValue(Types.ISocketServerService, socket);

            socket.addMessageListener(NetServerServiceMessageType.OPEN_SUCCESS, () =>
            {
                f.mapToValue("Map<string, IAccountModel>", new Map<string, IAccountModel>());

                const dbConfig: DataBaseServiceConfig = {
                    host: "127.0.0.1",
                    port: 27017,
                    dataBaseName: "auth_context_test_db"
                };

                f.mapToValue(Types.ServiceConfig, dbConfig);

                db = f.getInstance(Types.IDataBaseService);
                f.mapToValue(Types.IDataBaseService, db);

                db.addMessageListener(NetServerServiceMessageType.OPEN_SUCCESS, () =>
                {
                    const dropCollectionComplete = () =>
                    {
                        context = f.getInstance(Types.IAuthContext);
                        context.addMessageListener(AppContextMessageType.READY, () =>
                        {
                            done();
                        });

                        context.add(http);
                        context.add(socket);
                        context.add(db);
                    };

                    db.addMessageListener(DataBaseServiceMessageType.DROP_COLLECTION_FAIL, dropCollectionComplete, true);
                    db.addMessageListener(DataBaseServiceMessageType.DROP_COLLECTION_SUCCESS, dropCollectionComplete, true);

                    db.dropCollection(Collection.USERS.name);
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
        expect(socket.port).equals(http.port);
        expect(socket.host).equals(http.host);
    });

    it('testLoginSuccess', (done) =>
    {
        insert().then(() =>
        {
            login(json =>
            {
                expect(json.action).equals(SocketAction.LOGIN.name);
                expect(json.data.result).equals(Result.SUCCESS.name);

                done();
            });
        });
    });

    it('testLoginFailNoUser', (done) =>
    {
        insert().then(() =>
        {
            login(json =>
            {
                expect(json.action).equals(SocketAction.LOGIN.name);
                expect(json.data.result).equals(Result.FAIL.name);

                done();
            }, {email: "no@user.com"});
        });
    });

    it('testLoginFailWrongPass', (done) =>
    {
        insert().then(() =>
        {
            login(json =>
            {
                expect(json.action).equals(SocketAction.LOGIN.name);
                expect(json.data.result).equals(Result.FAIL.name);

                done();
            }, {email: "anton@javelin.ee", password: "ololo"});
        });
    });

    it('testLoginViaCmd', (done) =>
    {
        insert().then(() =>
        {
            login(json =>
            {
                expect(json.action).equals(SocketAction.LOGIN.name);
                expect(json.data.result).equals(Result.SUCCESS.name);

                done();
            }, undefined, true);
        });
    });

    it('testRegisterSuccess', (done) =>
    {
        register(json =>
        {
            expect(json.action).equals(SocketAction.REGISTER.name);
            expect(json.data.result).equals(Result.SUCCESS.name);

            done();
        });
    });

    it('testRegisterFailExists', (done) =>
    {
        insert().then(() =>
        {
            register(json =>
            {
                expect(json.action).equals(SocketAction.REGISTER.name);
                expect(json.data.result).equals(Result.FAIL.name);

                done();
            });
        });
    });

    it('testRegisterViaCmd', (done) =>
    {
        register(json =>
        {
            expect(json.action).equals(SocketAction.REGISTER.name);
            expect(json.data.result).equals(Result.SUCCESS.name);

            done();
        }, true);
    });

    function register(onComplete: (data: any) => void, byCmd = false): void
    {
        createClient(() =>
        {
            const regDto: RegisterDto = {email: "anton@javelin.ee", password: "123qwe", nick: "Anton"};
            !byCmd ? send(SocketAction.REGISTER, regDto) : cmd("register", regDto);
        }, json =>
        {
            onComplete(json);
        });
    }

    function login(onComplete: (data: any) => void, dto?: any, byCmd = false): void
    {
        createClient(() =>
        {
            const loginDto: LoginDto = {email: "anton@javelin.ee", password: "123qwe"};
            const d = dto ? dto : loginDto;
            !byCmd ? send(SocketAction.LOGIN, d) : cmd("login", d);
        }, json =>
        {
            onComplete(json);
        });
    }

    function cmd(name: string, data: any): void
    {
        const dto = {dto: data, clientId: client.id};
        context.tryToExecuteCommand(UIMediatorMessageType.INPUT,
            {value: "/cmd:auth:" + name + ":" + JSON.stringify(dto)}
        );
    }

    function send(action: Enum, data: any): void
    {
        client.emit("data", {action: action.name, data: data});
    }

    function createClient(onConnect: () => void, onData: (data: any) => void): void
    {
        client = io("ws://127.0.0.1:3001");

        client.on("connect", () =>
        {
            onConnect();
        });
        client.on("data", data =>
        {
            onData(data);
        });
    }

    async function insert()
    {
        await db.insert<RegisterDto>({}, Collection.USERS.name, [
            {email: "anton@javelin.ee", password: "123qwe", nick: "Anton"}
        ]);
    }

});