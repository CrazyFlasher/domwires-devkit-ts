import "reflect-metadata";
import {Done, Suite} from "mocha";
import {Enum, Factory, IFactory, Logger, LogLevel} from "domwires";
import {expect} from "chai";
import {
    ClientServiceRequestType,
    INetClientService,
    NetClientServiceConfig,
    NetClientServiceMessageType,
    ResponseData
} from "../src/com/domwires/devkit/client/common/service/net/INetClientService";
import {
    HttpMethod,
    IHttpServerService
} from "../src/com/domwires/devkit/server/common/service/net/http/IHttpServerService";
import {
    ISocketServerService,
    SocketServerServiceConfig
} from "../src/com/domwires/devkit/server/common/service/net/socket/ISocketServerService";
import {
    AxiosSioNetClientService
} from "../src/com/domwires/devkit/client/common/service/net/impl/AxiosSioNetClientService";
import {
    ExpressHttpServerService
} from "../src/com/domwires/devkit/server/common/service/net/http/impl/ExpressHttpServerService";
import {
    SioSocketServerService
} from "../src/com/domwires/devkit/server/common/service/net/socket/impl/SioSocketServerService";
import {
    NetServerServiceConfig,
    NetServerServiceMessageType,
    RequestData
} from "../src/com/domwires/devkit/server/common/service/net/INetServerService";
import {ServiceMessageType} from "../src/com/domwires/devkit/common/service/IService";
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
describe('NetClientServiceTest', function (this: Suite)
{
    const logger = new Logger(LogLevel.VERBOSE);

    let factory: IFactory;
    let client: INetClientService;
    let http: IHttpServerService;
    let socket: ISocketServerService;

    beforeEach((done: Done) =>
    {
        factory = new Factory(logger);

        factory.mapToType<INetClientService>(Types.INetClientService, AxiosSioNetClientService);
        factory.mapToType<IHttpServerService>(Types.IHttpServerService, ExpressHttpServerService);
        factory.mapToType<ISocketServerService>(Types.ISocketServerService, SioSocketServerService);

        const clientConfig: NetClientServiceConfig = {
            httpBaseUrl: "http://127.0.0.1:3015",
            socketUri: "ws://127.0.0.1:3010"
        };

        factory.mapToValue(Types.ServiceConfig, clientConfig);

        client = factory.getInstance(Types.INetClientService);

        const httpConfig: NetServerServiceConfig = {host: "127.0.0.1", port: 3015};

        factory.mapToValue(Types.ServiceConfig, httpConfig);

        http = factory.getInstance(Types.IHttpServerService);

        const httpOpenSuccess = () =>
        {
            http.startListen(([TestAction.TEST]));

            const sentHttpResponse = (success: boolean) =>
            {
                http.sendResponse<string>(success ? "hi" : "Invalid request data!", success ? 200 : 500);
            };

            const sendTcpResponse = (success: boolean) =>
            {
                const data: string = success ? "hi" : "Invalid request data!";
                socket.sendResponse(socket.requestFromClientId, {
                    action: socket.getRequestData().action,
                    data
                });
            };

            http.addMessageListener(NetServerServiceMessageType.GOT_REQUEST, () =>
            {
                logger.info("Got request from client:", http.getRequestData().action);

                if (http.getRequestData().method === HttpMethod.GET)
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
                else if (http.getRequestData().method === HttpMethod.POST)
                {
                    const data = http.getRequestData<TalkAction>().data;
                    if (data && data.say === "hello")
                    {
                        sentHttpResponse(true);
                    }
                    else
                    {
                        sentHttpResponse(false);
                    }
                }
            });

            const socketConfig: SocketServerServiceConfig = {host: httpConfig.host, port: 3010, http: http.nodeHttpServer};

            factory.mapToValue(Types.SocketServerServiceConfig, socketConfig);
            factory.mapToValue(Types.NetServerServiceConfig, socketConfig);
            factory.mapToValue(Types.ServiceConfig, socketConfig);
            factory.mapToValue(Types.IFactoryImmutable, socketConfig);
            factory.mapToValue(Types.IFactoryImmutable, factory);

            socket = factory.getInstance(Types.ISocketServerService);

            socket.addMessageListener(NetServerServiceMessageType.GOT_REQUEST, () =>
            {
                logger.info("Got request from client:", socket.getRequestData().action);

                const data = socket.getRequestData<TalkAction>().data;
                if (data && data.say === "hello")
                {
                    sendTcpResponse(true);
                }
                else
                {
                    sendTcpResponse(false);
                }
            });

            socket.addMessageListener(NetServerServiceMessageType.OPEN_SUCCESS, () =>
            {
                socket.startListen(([TestAction.TEST]));

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

        http.addMessageListener(NetServerServiceMessageType.OPEN_SUCCESS, httpOpenSuccess, true);

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
            socket.addMessageListener(NetServerServiceMessageType.CLOSE_SUCCESS, complete);

            socket.close();
        };

        client.addMessageListener(NetClientServiceMessageType.DISCONNECTED, http.close.bind(http));

        http.addMessageListener(NetServerServiceMessageType.CLOSE_SUCCESS, httpCloseSuccess, true);

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
        client.addMessageListener<RequestData>(NetClientServiceMessageType.HTTP_RESPONSE,
            (message, data) =>
        {
            expect(client.getResponseData().action).equals("test");
            expect(client.getResponseData().requestType).equals(ClientServiceRequestType.GET);
            expect(client.getResponseData().data).equals("hi");
            expect(data && data.data).equals("hi");

            done();
        });

        client.send<TalkAction>("test", {say: "hello"}, ClientServiceRequestType.GET);
    });

    it('testPost', (done: Done) =>
    {
        client.addMessageListener<ResponseData<TalkAction>>(NetClientServiceMessageType.HTTP_RESPONSE,
            (message, data) =>
        {
            expect(client.getResponseData().action).equals("test");
            expect(client.getResponseData().requestType).equals(ClientServiceRequestType.POST);
            expect(client.getResponseData().data).equals("hi");
            expect(data && data.data).equals("hi");

            done();
        });

        client.send<TalkAction>("test", {say: "hello"}, ClientServiceRequestType.POST);
    });

    it('testTcp', (done: Done) =>
    {
        client.addMessageListener<ResponseData<TalkAction>>(NetClientServiceMessageType.TCP_RESPONSE,
            (message, data) =>
        {
            expect(client.getResponseData().action).equals("test");
            expect(client.getResponseData().requestType).equals(ClientServiceRequestType.TCP);
            expect(client.getResponseData().data).equals("hi");
            expect(data && data.data).equals("hi");

            done();
        });

        client.send<TalkAction>("test", {say: "hello"}, ClientServiceRequestType.TCP);
    });

});

// }

type TalkAction = {
    say: string;
};