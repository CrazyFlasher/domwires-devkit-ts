import "reflect-metadata";
import {Done, Suite} from "mocha";
import {Enum, Factory, IFactory, Logger} from "domwires";
import {expect} from "chai";
import * as Http from "http";
import {IHttpServerService} from "../src/com/domwires/devkit/server/common/service/net/http/IHttpServerService";
import {
    ExpressHttpServerService
} from "../src/com/domwires/devkit/server/common/service/net/http/impl/ExpressHttpServerService";
import {
    NetServerServiceConfig,
    NetServerServiceMessageType
} from "../src/com/domwires/devkit/server/common/service/net/INetServerService";
import {ServiceMessageType} from "../src/com/domwires/devkit/common/service/IService";
import {Types} from "../src/com/domwires/devkit/common/Types";

const logger = new Logger();

class TestAction extends Enum
{
    public static readonly TEST:TestAction = new TestAction("test");
}

// describe('ExpressHttpServiceTest', function (this: Suite)
// {
//     run(ExpressHttpServerService);
// });

// function run(implementationClass: Class<IHttpServerService>): void
// {
describe('HttpServiceTest', function (this: Suite)
{
    let factory: IFactory;
    let http: IHttpServerService;

    beforeEach(() =>
    {
        factory = new Factory(logger);
        factory.mapToType<IHttpServerService>(Types.IHttpServerService, ExpressHttpServerService);
        // factory.mapToType(DW_TYPES.IHttpServerService, implementationClass);

        const httpConfig: NetServerServiceConfig = {host: "127.0.0.1", port: 3123};

        factory.mapToValue(Types.ServiceConfig, httpConfig);

        http = factory.getInstance(Types.IHttpServerService);
    });

    afterEach((done: Done) =>
    {
        const complete = () =>
        {
            http.dispose();
            factory.dispose();

            done();
        };

        http.addMessageListener(NetServerServiceMessageType.CLOSE_SUCCESS, complete);

        if (http.isOpened)
        {
            http.close();
        }
        else
        {
            complete();
        }
    });

    it('testInit', (done: Done) =>
    {
        http.addMessageListener(ServiceMessageType.INIT_SUCCESS, () =>
        {
            done();
        });

        http.init();
    });

    it('testIsOpened', (done: Done) =>
    {
        http.addMessageListener(NetServerServiceMessageType.OPEN_SUCCESS, () =>
        {
            expect(http.isOpened).true;

            http.close();
        });

        http.addMessageListener(NetServerServiceMessageType.CLOSE_SUCCESS, () =>
        {
            expect(http.isOpened).false;

            done();
        });

        expect(http.isOpened).false;

        http.init();
    });

    it('testIsListening', (done: Done) =>
    {
        http.addMessageListener(NetServerServiceMessageType.OPEN_SUCCESS, () =>
        {
            expect(http.isListening(TestAction.TEST)).false;

            http.startListen([TestAction.TEST]);

            expect(http.isListening(TestAction.TEST)).true;

            http.stopListen([TestAction.TEST]);

            expect(http.isListening(TestAction.TEST)).false;

            clientRequest("http://127.0.0.1:3123/test", (data: string, code?: number) =>
            {
                expect(code).equals(404);

                done();
            });
        });

        http.init();
    });

    it('testGotRequestSendResponse200', (done: Done) =>
    {
        http.addMessageListener(NetServerServiceMessageType.OPEN_SUCCESS, () =>
        {
            http.startListen([TestAction.TEST]);

            clientRequest("http://127.0.0.1:3123/test", (data: string, code?: number) =>
            {
                expect(data).equals("PIZDEC!");
                expect(code).equals(200);

                done();
            });
        });

        http.addMessageListener(NetServerServiceMessageType.GOT_REQUEST, () =>
        {
            http.sendResponse<string>("PIZDEC!");
        });

        http.init();
    });

    it('testGotRequestSendResponse404', (done: Done) =>
    {
        http.addMessageListener(NetServerServiceMessageType.OPEN_SUCCESS, () =>
        {
            http.startListen([TestAction.TEST]);

            clientRequest("http://127.0.0.1:3123/tes", (data: string, code?: number) =>
            {
                expect(code).equals(404);

                done();
            });
        });

        http.addMessageListener(NetServerServiceMessageType.GOT_REQUEST, () =>
        {
            http.sendResponse({id: http.getRequestData().action, data: "PIZDEC!"});
        });

        http.init();
    });

    it('testGotRequestSendResponseQuery', (done: Done) =>
    {
        http.addMessageListener(NetServerServiceMessageType.OPEN_SUCCESS, () =>
        {
            http.startListen([TestAction.TEST]);

            clientRequest("http://127.0.0.1:3123/test?id=olo");
        });

        http.addMessageListener(NetServerServiceMessageType.GOT_REQUEST, () =>
        {
            expect(http.getRequestQueryParam("id")).equals("olo");
            done();
        });

        http.init();
    });
});

// }

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