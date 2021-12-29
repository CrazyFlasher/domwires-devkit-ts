import "reflect-metadata";
import {Done, Suite} from "mocha";
import {SioSocketServerService} from "../src/com/domwires/devkit/service/net/server/socket/impl/SioSocketServerService";
import {Factory, IFactory, Logger} from "domwires";
import {DW_TYPES} from "../src/com/domwires/devkit/dw_consts";
import {NetServerServiceMessageType} from "../src/com/domwires/devkit/service/net/INetServerService";
import {ServiceMessageType} from "../src/com/domwires/devkit/service/IService";
import {
    ISocketServerService,
    SocketRequestResponseType,
    SocketServerServiceConfig,
    SocketServerServiceMessageType
} from "../src/com/domwires/devkit/service/net/server/socket/ISocketServerService";
import {io, Socket} from "socket.io-client";
import {expect} from "chai";
import {injectable, postConstruct} from "inversify";

/*describe('SioSocketServerServiceTest', function (this: Suite)
{
    run(SioSocketServerService);
});*/

// function run(implementationClass: Class<ISocketServerService>): void
// {
describe('SocketServerServiceTest', function (this: Suite)
{
    let factory: IFactory;
    let server: ISocketServerService<ClientData>;

    beforeEach(() =>
    {
        factory = new Factory(new Logger());
        factory.mapToType(DW_TYPES.ISocketServerService, SioSocketServerService);

        const socketConfig: SocketServerServiceConfig = {host: "127.0.0.1", port: 3000};

        factory.mapToValue(DW_TYPES.SocketServerServiceConfig, socketConfig);
        factory.mapToValue(DW_TYPES.NetServerServiceConfig, socketConfig);
        factory.mapToValue(DW_TYPES.ServiceConfig, socketConfig);
        factory.mapToValue(DW_TYPES.Class, ClientData, "clientDataClass");
        factory.mapToValue(DW_TYPES.IFactoryImmutable, factory);

        server = factory.getInstance(DW_TYPES.ISocketServerService);
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
            client = io("ws://127.0.0.1:3000");
        });

        server.addMessageListener(SocketServerServiceMessageType.CLIENT_CONNECTED, () =>
        {
            expect(server.connectionsCount).equals(1);
            expect(server.getClientDataById(server.connectedClientId).created).true;

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
            io("ws://127.0.0.1:3000");
        });

        server.addMessageListener(SocketServerServiceMessageType.CLIENT_CONNECTED, () =>
        {
            expect(server.connectionsCount).equals(1);

            server.disconnectClient(server.connectedClientId);
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
            server.startListen({id: "test", type: SocketRequestResponseType.TCP});

            client = io("ws://127.0.0.1:3000");
            client.on("data", json =>
            {
                expect(json.id).equals("test");
                expect(json.data).equals("otvet");

                client.disconnect();

                done();
            });
            client.emit("data", {id: "test", data: "lalala!"});
        });

        server.addMessageListener(NetServerServiceMessageType.GOT_REQUEST, () =>
        {
            expect(server.requestData.id).equals("test");
            expect(server.requestData.data).equals("lalala!");

            server.sendResponse(server.requestFromClientId, {
                id: "test", type: SocketRequestResponseType.TCP,
                data: "otvet"
            });
        });

        server.init();
    });
});

// }

@injectable()
class ClientData
{
    private _created: boolean;

    public get created(): boolean
    {
        return this._created;
    }

    @postConstruct()
    private postConstruct()
    {
        this._created = true;
    }
}