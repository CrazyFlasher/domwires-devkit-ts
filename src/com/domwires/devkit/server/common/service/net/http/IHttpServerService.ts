import {INetServerService, INetServerServiceImmutable} from "../INetServerService";
import {Enum} from "domwires";
import {Server} from "http";
import {DwError} from "../../../../../common/DwError";

export class HttpMethod extends Enum
{
    // This prop is needed for transpiler to define HttpRequestResponseType as unique type
    private readonly instance!: HttpMethod;

    public static readonly GET: HttpMethod = new HttpMethod("GET");
    public static readonly POST: HttpMethod = new HttpMethod("POST");

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // key cannot be undefined, because name in constructor is not optional
    private static readonly MAP: Map<string, HttpMethod> = new Map([
        [HttpMethod.GET.name, HttpMethod.GET],
        [HttpMethod.POST.name, HttpMethod.POST]
    ]);

    public static get(name: string): HttpMethod
    {
        if (HttpMethod.MAP.has(name))
        {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            // cannot be undefined, because we have check above
            return HttpMethod.MAP.get(name);
        }

        throw new Error(DwError.INVALID_ENUM_NAME.name + ": " + name);
    }

    public constructor(name: string)
    {
        super(name);
    }
}

export interface IHttpServerServiceImmutable extends INetServerServiceImmutable
{
}

export interface IHttpServerService extends IHttpServerServiceImmutable, INetServerService
{
    sendResponse<TData>(data: TData, statusCode?: number,
                        customHeaders?: Map<string, number | string | ReadonlyArray<string>>): IHttpServerService;

    get nodeHttpServer(): Server;
}