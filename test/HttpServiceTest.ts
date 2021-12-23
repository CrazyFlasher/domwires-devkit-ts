import "reflect-metadata";
import {Done, Suite} from "mocha";
import {Factory, IFactory, logger} from "domwires";
import {DW_TYPES} from "../src/com/domwires/devkit/dw_consts";
import {ExpressHttpServerService} from "../src/com/domwires/devkit/service/net/server/http/imp/ExpressHttpServerService";
import {
    HttpRequestResponseType,
    IHttpServerService
} from "../src/com/domwires/devkit/service/net/server/http/IHttpServerService";
import {
    NetServerServiceConfig,
    NetServerServiceMessageType,
    RequestResponse
} from "../src/com/domwires/devkit/service/net/INetServerService";
import {ServiceMessageType} from "../src/com/domwires/devkit/service/IService";
import {expect} from "chai";
import * as Http from "http";

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
        factory = new Factory();
        factory.mapToType(DW_TYPES.IHttpServerService, ExpressHttpServerService);
        // factory.mapToType(DW_TYPES.IHttpServerService, implementationClass);

        const httpConfig: NetServerServiceConfig = {host: "127.0.0.1", port: 3000};

        factory.mapToValue(DW_TYPES.NetServerServiceConfig, httpConfig);
        factory.mapToValue(DW_TYPES.ServiceConfig, httpConfig);

        http = factory.getInstance(DW_TYPES.IHttpServerService);
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
            const req: RequestResponse<HttpRequestResponseType> = {id: "test", type: HttpRequestResponseType.GET};

            expect(http.isListening(req)).false;

            http.startListen(req);

            expect(http.isListening(req)).true;

            http.stopListen(req);

            expect(http.isListening(req)).false;

            done();
        });

        http.init();
    });

    it('testGotRequestSendResponse200', (done: Done) =>
    {
        http.addMessageListener(NetServerServiceMessageType.OPEN_SUCCESS, () =>
        {
            http.startListen({id: "test", type: HttpRequestResponseType.GET});

            clientRequest("http://127.0.0.1:3000/test", (data: string, code: number) =>
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
            http.startListen({id: "test", type: HttpRequestResponseType.GET});

            clientRequest("http://127.0.0.1:3000/tes", (data: string, code: number) =>
            {
                expect(code).equals(404);

                done();
            });
        });

        http.addMessageListener(NetServerServiceMessageType.GOT_REQUEST, () =>
        {
            http.sendResponse({id: http.requestData.id, data: "PIZDEC!"});
        });

        http.init();
    });

    it('testGotRequestSendResponseQuery', (done: Done) =>
    {
        http.addMessageListener(NetServerServiceMessageType.OPEN_SUCCESS, () =>
        {
            http.startListen({id: "test", type: HttpRequestResponseType.GET});

            clientRequest("http://127.0.0.1:3000/test?id=olo");
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

function clientRequest(url: string, callback?: (data: string, code: number) => void, method?: string): void
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