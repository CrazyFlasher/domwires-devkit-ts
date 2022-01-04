import "reflect-metadata";
import {Done, Suite} from "mocha";
import {Factory, IFactory, Logger} from "domwires";
import {DW_TYPES} from "../src";
import {
    ClientServiceRequestType,
    INetClientService,
    NetClientServiceConfig,
    NetClientServiceMessageType
} from "../src";
import {AxiosSioNetClientService} from "../src";
import {ServiceMessageType} from "../src";
import {
    HttpRequestResponseType,
    IHttpServerService
} from "../src";
import {ExpressHttpServerService} from "../src";
import {
    NetServerServiceConfig,
    NetServerServiceMessageType
} from "../src";
import {
    ISocketServerService,
    SocketRequestResponseType, SocketServerServiceConfig
} from "../src";
import {SioSocketServerService} from "../src";
import {injectable, postConstruct} from "inversify";
import {expect} from "chai";

/*describe('SioSocketServerServiceTest', function (this: Suite)
{
    run(SioSocketServerService);
});*/

// function run(implementationClass: Class<ISocketServerService>): void
// {
describe('NetClientServiceTest', function (this: Suite)
{
    const logger = new Logger();

    let factory: IFactory;
    let client: INetClientService;
    let http: IHttpServerService;
    let socket: ISocketServerService<ClientData>;

    beforeEach((done: Done) =>
    {
        factory = new Factory(logger);

        factory.mapToType(DW_TYPES.INetClientService, AxiosSioNetClientService);
        factory.mapToType(DW_TYPES.IHttpServerService, ExpressHttpServerService);
        factory.mapToType(DW_TYPES.ISocketServerService, SioSocketServerService);

        const clientConfig: NetClientServiceConfig = {
            httpBaseUrl: "http://127.0.0.1:3000",
            socketUri: "ws://127.0.0.1:3001"
        };

        factory.mapToValue(DW_TYPES.NetClientServiceConfig, clientConfig);
        factory.mapToValue(DW_TYPES.ServiceConfig, clientConfig);

        client = factory.getInstance(DW_TYPES.INetClientService);

        const httpConfig: NetServerServiceConfig = {host: "127.0.0.1", port: 3000};

        factory.mapToValue(DW_TYPES.NetServerServiceConfig, httpConfig);
        factory.mapToValue(DW_TYPES.ServiceConfig, httpConfig);

        http = factory.getInstance(DW_TYPES.IHttpServerService);

        const httpOpenSuccess = () =>
        {
            http.removeMessageListener(NetServerServiceMessageType.OPEN_SUCCESS, httpOpenSuccess);

            http.startListen({id: "test", type: HttpRequestResponseType.GET});
            http.startListen({id: "test", type: HttpRequestResponseType.POST});

            const sentHttpResponse = (success: boolean) =>
            {
                http.sendResponse<string>(success ? "hi" : "Invalid request data!", success ? 200 : 500);
            };

            const sendTcpResponse = (success: boolean) =>
            {
                const data: string = success ? "hi" : "Invalid request data!";
                socket.sendResponse(socket.requestFromClientId, {
                    id: socket.requestData.id,
                    type: SocketRequestResponseType.TCP,
                    data
                });
            };

            http.addMessageListener(NetServerServiceMessageType.GOT_REQUEST, () =>
            {
                logger.info("Got request from client:", http.requestData.id);

                if (http.requestData.type === HttpRequestResponseType.GET)
                {
                    if (http.getRequestQueryParam("say") === "hello")
                    {
                        sentHttpResponse(true);
                    }
                    else
                    {
                        sentHttpResponse(false);
                    }
                }
                else if (http.requestData.type === HttpRequestResponseType.POST)
                {
                    if (http.requestData.data.say === "hello")
                    {
                        sentHttpResponse(true);
                    }
                    else
                    {
                        sentHttpResponse(false);
                    }
                }
            });

            const socketConfig: SocketServerServiceConfig = {host: httpConfig.host, port: 3001, http: http.nodeHttpServer};

            factory.mapToValue(DW_TYPES.SocketServerServiceConfig, socketConfig);
            factory.mapToValue(DW_TYPES.NetServerServiceConfig, socketConfig);
            factory.mapToValue(DW_TYPES.ServiceConfig, socketConfig);
            factory.mapToValue(DW_TYPES.Class, ClientData, "clientDataClass");
            factory.mapToValue(DW_TYPES.IFactoryImmutable, socketConfig);
            factory.mapToValue(DW_TYPES.IFactoryImmutable, factory);

            socket = factory.getInstance(DW_TYPES.ISocketServerService);

            socket.addMessageListener(NetServerServiceMessageType.GOT_REQUEST, () =>
            {
                logger.info("Got request from client:", socket.requestData.id);

                if (socket.requestData.type === SocketRequestResponseType.TCP)
                {
                    if (socket.requestData.data.say === "hello")
                    {
                        sendTcpResponse(true);
                    }
                    else
                    {
                        sendTcpResponse(false);
                    }
                }
            });

            socket.addMessageListener(NetServerServiceMessageType.OPEN_SUCCESS, () =>
            {
                socket.startListen({id: "test", type: SocketRequestResponseType.TCP});

                client.addMessageListener(NetClientServiceMessageType.CONNECTED, () =>
                {
                    done();
                });
                client.addMessageListener(ServiceMessageType.INIT_SUCCESS, () =>
                {
                    client.connect();
                });

                client.init();
            });

            socket.init();
        };

        http.addMessageListener(NetServerServiceMessageType.OPEN_SUCCESS, httpOpenSuccess);

        http.init();
    });

    afterEach((done: Done) =>
    {
        const complete = () =>
        {
            http.dispose();
            socket.dispose();
            client.dispose();

            factory.dispose();

            done();
        };

        const httpCloseSuccess = () =>
        {
            http.removeMessageListener(NetServerServiceMessageType.CLOSE_SUCCESS, httpCloseSuccess);
            socket.addMessageListener(NetServerServiceMessageType.CLOSE_SUCCESS, complete);

            socket.close();
        };

        client.addMessageListener(NetClientServiceMessageType.DISCONNECTED, http.close.bind(http));

        http.addMessageListener(NetServerServiceMessageType.CLOSE_SUCCESS, httpCloseSuccess);

        if (client.isConnected)
        {
            client.disconnect();
        }
        else
        {
            http.close();
        }
    });

    it('testGet', (done: Done) =>
    {
        client.addMessageListener(NetClientServiceMessageType.HTTP_RESPONSE, (message, data) =>
        {
            expect(client.responseData.id).equals("test");
            expect(client.responseData.type).equals(ClientServiceRequestType.GET);
            expect(client.responseData.data).equals("hi");
            expect(data.data).equals("hi");

            done();
        });

        client.send<TalkAction>({id: "test", type: ClientServiceRequestType.GET, data: {say: "hello"}});
    });

    it('testPost', (done: Done) =>
    {
        client.addMessageListener(NetClientServiceMessageType.HTTP_RESPONSE, (message, data) =>
        {
            expect(client.responseData.id).equals("test");
            expect(client.responseData.type).equals(ClientServiceRequestType.POST);
            expect(client.responseData.data).equals("hi");
            expect(data.data).equals("hi");

            done();
        });

        client.send<TalkAction>({id: "test", type: ClientServiceRequestType.POST, data: {say: "hello"}});
    });

    it('testTcp', (done: Done) =>
    {
        client.addMessageListener(NetClientServiceMessageType.TCP_RESPONSE, (message, data) =>
        {
            expect(client.responseData.id).equals("test");
            expect(client.responseData.type).equals(ClientServiceRequestType.TCP);
            expect(client.responseData.data).equals("hi");
            expect(data.data).equals("hi");

            done();
        });

        client.send<TalkAction>({id: "test", type: ClientServiceRequestType.TCP, data: {say: "hello"}});
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

type TalkAction = {
    say: string;
};