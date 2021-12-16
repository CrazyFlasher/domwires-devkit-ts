import {INetServerService, INetServerServiceImmutable} from "../../INetServerService";
import {Enum} from "domwires";
import {DwError} from "../../../../DwError";

export class HttpRequestResponseType extends Enum
{
    // This prop is needed for transpiler to define HttpRequestResponseType as unique type
    private readonly instance: HttpRequestResponseType;

    public static readonly GET: HttpRequestResponseType = new HttpRequestResponseType();
    public static readonly POST: HttpRequestResponseType = new HttpRequestResponseType();

    public static fromName(name: string): HttpRequestResponseType
    {
        if (name === "GET") return HttpRequestResponseType.GET;
        if (name === "POST") return HttpRequestResponseType.POST;

        throw new Error(DwError.INVALID_ENUM_NAME.name + ": " + name);
    }
}

export interface IHttpServerServiceImmutable extends INetServerServiceImmutable<HttpRequestResponseType>
{
    getQueryParam(id: string): string;
}

export interface IHttpServerService extends IHttpServerServiceImmutable, INetServerService<HttpRequestResponseType>
{
    sendResponse<T>(data: T, statusCode?: number,
                    customHeaders?: Map<string, number | string | ReadonlyArray<string>>): IHttpServerService;
}