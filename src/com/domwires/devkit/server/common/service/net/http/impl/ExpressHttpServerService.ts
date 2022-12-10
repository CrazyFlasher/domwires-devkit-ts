import {AbstractNetServerService} from "../../AbstractNetServerService";
import {HttpMethod, IHttpServerService} from "../IHttpServerService";
import {INetServerService, NetServerServiceMessageType} from "../../INetServerService";
import express, {Response} from "express";
import {Express, Router} from "express/ts4.0";
import {Server} from "http";
import bodyParser from "body-parser";
import cors from "cors";
import {Enum} from "domwires";
import {IValidator} from "../../../../../../common/IValidator";

export class ExpressHttpServerService extends AbstractNetServerService implements IHttpServerService
{
    private app!: Express;
    private server!: Server;
    private router!: Router;

    private pendingResponseList: Response[] = [];

    protected override createServer()
    {
        this.app = express();
        this.router = express.Router();
        this.server = this.app.listen(this.netServerServiceConfig.port, this.netServerServiceConfig.host,
            this.openSuccess.bind(this)).on("error", this.openFail.bind(this));

        this.app.use(cors({origin: "*"}));
        this.app.use(bodyParser.urlencoded({extended: false}));
        this.app.use(bodyParser.json());
        this.app.use("/", this.router);
        this.app.use((req, res) =>
        {
            res.status(404);
            res.type("txt").send("Not found");
        });
    }

    protected override startListenSingle(action: { action: Enum; validator?: IValidator }): void
    {
        super.startListenSingle(action);

        if (this._isOpened)
        {
            this.router.all("/" + action.action.name, (req, res) =>
            {
                if (this.requestDataIsValid(action.action.name, req.query))
                {
                    this.pendingResponseList.push(res);

                    this.dispatchMessage(NetServerServiceMessageType.GOT_REQUEST, {
                            action: action.action.name,
                            data: req.body,
                            method: HttpMethod.get(req.method),
                            requestQueryParams: (id: string) => req.query ? Reflect.get(req.query, id) : undefined
                        }
                    );
                } else
                {
                    this.warn("Non-protocol request from client:", req.path, req.query, req.body);
                }
            });
        }
    }

    protected override stopListenSingle(action: Enum): void
    {
        super.stopListenSingle(action);

        for (const route of this.router.stack)
        {
            if (route.route.path === "/" + action.name)
            {
                this.router.stack.splice(route, 1);

                break;
            }
        }
    }

    protected override openSuccess()
    {
        this.initSuccess();

        super.openSuccess();
    }

    public override close(): INetServerService
    {
        if (this._isOpened)
        {
            if (this.pendingResponseList.length)
            {
                this.pendingResponseList.map(value => value.end("Server closed!"));
                this.pendingResponseList.length = 0;
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

    public get nodeHttpServer(): Server
    {
        return this.server;
    }

    public sendResponse<TData>(data: TData, statusCode = 200,
                               customHeaders?: Map<string, number | string | ReadonlyArray<string>>): IHttpServerService
    {
        if (!this.pendingResponseList)
        {
            throw new Error("There are no pending response!");
        }

        const pr = this.pendingResponseList.shift();

        if (pr)
        {
            pr.statusCode = statusCode;

            if (customHeaders)
            {
                customHeaders.forEach((value, key) => pr.setHeader(key, value));
            }

            pr.end(typeof data === "object" ? JSON.stringify(data) : data);
        }

        return this;
    }

}