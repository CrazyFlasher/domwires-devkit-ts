import {AbstractNetServerService} from "../../../AbstractNetServerService";
import {HttpRequestResponseType, IHttpServerService} from "../IHttpServerService";
import {INetServerService, NetServerServiceMessageType, RequestResponse} from "../../../INetServerService";
import express, {Response} from "express";
import {Express, Router} from "express/ts4.0";
import {Server} from "http";
import {ParsedQs} from "qs";
import bodyParser from "body-parser";
import cors from "cors";

// TODO: make final
export class ExpressHttpServerService extends AbstractNetServerService<HttpRequestResponseType> implements IHttpServerService
{
    private app: Express;
    private server: Server;
    private router: Router;

    private pendingResponse: Response;
    private requestQuery: ParsedQs;

    protected override createServer()
    {
        this.app = express();
        this.router = express.Router();
        this.server = this.app.listen(this.netServerServiceConfig.port, this.netServerServiceConfig.host, this.openSuccess.bind(this));

        this.app.use(cors({origin: true}));
        this.app.use(bodyParser.urlencoded({extended: false}));
        this.app.use(bodyParser.json());
        this.app.use("/", this.router);
        this.app.use((req, res) =>
        {
            res.status(404);
            res.type("txt").send("Not found");
        });
    }

    public override startListen(request: RequestResponse<HttpRequestResponseType>): INetServerService<HttpRequestResponseType>
    {
        super.startListen(request);

        if (this._isOpened)
        {
            this.router.all("/" + request.id, (req, res) =>
            {
                this.requestQuery = req.query;
                this._requestData = {id: req.path, data: req.body, type: HttpRequestResponseType.fromName(req.method)};
                this.pendingResponse = res;

                this.dispatchMessage(NetServerServiceMessageType.GOT_REQUEST);
            });
        }

        return this;
    }

    protected override openSuccess()
    {
        this.initSuccess();

        super.openSuccess();
    }

    public override close(): INetServerService<HttpRequestResponseType>
    {
        if (this._isOpened)
        {
            if (this.pendingResponse)
            {
                this.pendingResponse.end("Server closed!");
                this.pendingResponse = null;
            }

            this.server.close((err?: Error) =>
            {
                if (err)
                {
                    this.closeFail(err);
                }
                else
                {
                    this.closeSuccess();
                }
            });
        }

        return this;
    }

    public getRequestQueryParam(id: string): string
    {
        return this.requestQuery ? this.requestQuery[id] as string : null;
    }

    public sendResponse<T>(data: T, statusCode = 200,
                           customHeaders?: Map<string, number | string | ReadonlyArray<string>>): IHttpServerService
    {
        if (!this.pendingResponse)
        {
            throw new Error("There are no pending response!");
        }

        const pr = this.pendingResponse;
        this.pendingResponse = null;

        pr.statusCode = statusCode;

        if (customHeaders)
        {
            customHeaders.forEach((value, key) => pr.setHeader(key, value));
        }

        pr.end(data);

        return this;
    }

}