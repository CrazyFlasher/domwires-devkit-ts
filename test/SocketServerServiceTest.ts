import "reflect-metadata";
import {Done, Suite} from "mocha";
import {Enum, Factory, IFactory, Logger, LogLevel} from "domwires";
import {io, Socket} from "socket.io-client";
import {expect} from "chai";
import {
    ISocketServerService,
    SocketServerServiceConfig,
    SocketServerServiceMessageType
} from "../src/com/domwires/devkit/server/common/service/net/socket/ISocketServerService";
import {
    SioSocketServerService
} from "../src/com/domwires/devkit/server/common/service/net/socket/impl/SioSocketServerService";
import {ServiceMessageType} from "../src/com/domwires/devkit/common/service/IService";
import {NetServerServiceMessageType} from "../src/com/domwires/devkit/server/common/service/net/INetServerService";
import {Types} from "../src/com/domwires/devkit/common/Types";

class TestAction extends Enum
{
    public static readonly TEST:TestAction = new TestAction("test");
}

/*describe('SioSocketServerServiceTest', function (this: Suite)
{
    run(SioSocketServerService);
});*/

// function run(implementationClass: Class<ISocketServerService>): void
// {
describe('SocketServerServiceTest', function (this: Suite)
{
    let factory: IFactory;
    let server: ISocketServerService;

    beforeEach(() =>
    {
        factory = new Factory(new Logger(LogLevel.VERBOSE));
        factory.mapToType<SioSocketServerService>(Types.ISocketServerService, SioSocketServerService);

        const socketConfig: SocketServerServiceConfig = {host: "127.0.0.1", port: 3010};

        factory.mapToValue(Types.ServiceConfig, socketConfig);
        factory.mapToValue(Types.IFactoryImmutable, factory);

        server = factory.getInstance(Types.ISocketServerService);
    });

    afterEach((done: Done) =>
    {
        const complete = () =>
        {
            server.dispose();
            factory.dispose();

            done();
        };

        server.addMessageListener(NetServerServiceMessageType.CLOSE_SUCCESS, complete);

        if (server.isOpened)
        {
            server.close();
        }
        else
        {
            complete();
        }
    });

    it('testInit', (done: Done) =>
    {
        server.addMessageListener(ServiceMessageType.INIT_SUCCESS, () =>
        {
            done();
        });

        server.init();
    });

    it('testClientConnectedDisconnectedByClient', (done: Done) =>
    {
        let client: Socket;

        server.addMessageListener(NetServerServiceMessageType.OPEN_SUCCESS, () =>
        {
            client = io("ws://127.0.0.1:3010");
        });

        server.addMessageListener(SocketServerServiceMessageType.CLIENT_CONNECTED, () =>
        {
            expect(server.connectionsCount).equals(1);

            client.disconnect();
        });

        server.addMessageListener(SocketServerServiceMessageType.CLIENT_DISCONNECTED, () =>
        {
            expect(server.connectionsCount).equals(0);

            done();
        });

        server.init();
    });

    it('testClientConnectedDisconnectedByServer', (done: Done) =>
    {
        server.addMessageListener(NetServerServiceMessageType.OPEN_SUCCESS, () =>
        {
            io("ws://127.0.0.1:3010");
        });

        server.addMessageListener(SocketServerServiceMessageType.CLIENT_CONNECTED, (message, data) =>
        {
            expect(server.connectionsCount).equals(1);

            server.disconnectClient(data!.clientId);
        });

        server.addMessageListener(SocketServerServiceMessageType.CLIENT_DISCONNECTED, () =>
        {
            expect(server.connectionsCount).equals(0);

            done();
        });

        server.init();
    });

    it('testGotRequestSendResponse', (done: Done) =>
    {
        let client: Socket;

        server.addMessageListener(NetServerServiceMessageType.OPEN_SUCCESS, () =>
        {
            server.startListen([{action: TestAction.TEST}]);

            client = io("ws://127.0.0.1:3010");
            client.on("data", json =>
            {
                expect(json.action).equals("test");
                expect(json.data).equals("otvet");

                client.disconnect();

                done();
            });
            client.emit("data", {action: "test", data: "lalala!"});
        });

        server.addMessageListener(NetServerServiceMessageType.GOT_REQUEST, (message, data) =>
        {
            expect(data!.action).equals("test");
            expect(data!.data).equals("lalala!");

            server.sendResponse(data!.requestFromClientId!, {
                action: "test",
                data: "otvet"
            });
        });

        server.init();
    });
});

// }