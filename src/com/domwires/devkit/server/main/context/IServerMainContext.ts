import "../../auth/context/IServerAuthContext";
import "../../../common/main/model/IAccountModelContainer";

import {AppContextMessageType} from "../../../common/app/context/IAppContext";
import {IInputView} from "../../../common/app/view/IInputView";
import {Class, setDefaultImplementation} from "domwires";
import {CliInputView} from "../view/CliInputView";
import {IHttpServerService} from "../../common/service/net/http/IHttpServerService";
import {ISocketServerService, SocketServerServiceConfig} from "../../common/service/net/socket/ISocketServerService";
import {NetServerServiceConfig, NetServerServiceMessageType} from "../../common/service/net/INetServerService";
import {DataBaseServiceConfig} from "../../common/service/net/db/IDataBaseService";
import {Types} from "../../../common/Types";
import {OpenServiceCommand} from "../command/OpenServiceCommand";
import {CreateChildContextsCommand} from "../../../common/main/command/CreateChildContextsCommand";
import {CloseServiceCommand} from "../command/CloseServiceCommand";
import {ShutDownCompleteCommand} from "../../../common/main/command/ShutDownCompleteCommand";
import {InitializationCompleteCommand} from "../../../common/main/command/InitializationCompleteCommand";
import {ConfigIds} from "../../../common/ConfigIds";
import {ServerConfigIds} from "../../ServerConfigIds";
import {AbstractMainContext, IMainContext, IMainContextImmutable} from "../../../common/main/context/IMainContext";
import {IServerAuthContext} from "../../auth/context/IServerAuthContext";
import {IAuthDataBaseService} from "../../common/service/net/db/IAuthDataBaseService";
import {EmailServiceConfig, IEmailService} from "../../common/service/net/email/IEmailService";
import {ServiceMessageType} from "../../../common/service/IService";
import {InitEmailServiceCommand} from "../command/InitEmailServiceCommand";

export interface IServerMainContextImmutable extends IMainContextImmutable
{

}

export interface IServerMainContext extends IServerMainContextImmutable, IMainContext
{
    get db(): IAuthDataBaseService;

    get socket(): ISocketServerService;

    get http(): IHttpServerService;

    get authContext(): IServerAuthContext;

    get email(): IEmailService;
}

export class ServerMainContext extends AbstractMainContext implements IServerMainContext
{
    private _authContext!: IServerAuthContext;

    private _http!: IHttpServerService;
    private _socket!: ISocketServerService;
    private _db!: IAuthDataBaseService;
    private _email!: IEmailService;

    protected override init()
    {
        super.init();

        this.createHttp();
        this.createSocket();
        this.createDb();
        this.createEmail();

        this.map(NetServerServiceMessageType.OPEN_SUCCESS, OpenServiceCommand, {service: this._socket}).addTargetGuards(this._http);
        this.map(NetServerServiceMessageType.OPEN_SUCCESS, OpenServiceCommand, {service: this._db}).addTargetGuards(this._socket);
        this.map(ServiceMessageType.INIT_SUCCESS, InitEmailServiceCommand, {service: this._email}).addTargetGuards(this._db);
        this.map(NetServerServiceMessageType.OPEN_SUCCESS, CreateChildContextsCommand).addTargetGuards(this._db);

        this.map([NetServerServiceMessageType.CLOSE_SUCCESS, NetServerServiceMessageType.CLOSE_FAIL],
            CloseServiceCommand, {service: this._socket}).addTargetGuards(this._db);

        this.map([NetServerServiceMessageType.CLOSE_SUCCESS, NetServerServiceMessageType.CLOSE_FAIL],
            CloseServiceCommand, {service: this._http}).addTargetGuards(this._socket);

        this.map([NetServerServiceMessageType.CLOSE_SUCCESS, NetServerServiceMessageType.CLOSE_FAIL],
            ShutDownCompleteCommand).addTargetGuards(this._http);

        this.executeCommand(OpenServiceCommand, {service: this._http});
    }

    public override dispose(): void
    {
        this.executeCommand(CloseServiceCommand, {service: this._db});
    }

    protected override get defaultUIViewClass(): Class<IInputView>
    {
        return CliInputView;
    }

    private createHttp(): void
    {
        const netHost: string = this.serviceFactory.getInstance(Types.string, ConfigIds.netHost);
        const httpPort: number = this.serviceFactory.getInstance(Types.number, ConfigIds.httpPort);

        const httpConfig: NetServerServiceConfig = {host: netHost, port: httpPort};

        this.serviceFactory.mapToValue(Types.ServiceConfig, httpConfig);

        this._http = this.getServiceInstance(Types.IHttpServerService);

        this.addModel(this._http);
    }

    private createSocket(): void
    {
        const socketConfig: SocketServerServiceConfig = {
            enabled: this._http.enabled,
            host: this._http.host,
            port: this.serviceFactory.getInstance(Types.number, ConfigIds.socketPort),
            http: this._http.nodeHttpServer
        };

        this.serviceFactory.mapToValue(Types.ServiceConfig, socketConfig);

        this._socket = this.getServiceInstance(Types.ISocketServerService);

        this.addModel(this._socket);
    }

    private createDb(): void
    {
        const dbConfig: DataBaseServiceConfig = {
            host: this.serviceFactory.getInstance(Types.string, ServerConfigIds.dbHost),
            port: this.serviceFactory.getInstance(Types.number, ServerConfigIds.dbPort),
            dataBaseName: this.serviceFactory.getInstance(Types.string, ServerConfigIds.dbName),
        };

        this.serviceFactory.mapToValue(Types.ServiceConfig, dbConfig);

        this._db = this.getServiceInstance(Types.IAuthDataBaseService);

        this.addModel(this._db);
    }

    private createEmail(): void
    {
        const emailConfig: EmailServiceConfig = {
            host: this.serviceFactory.getInstance(Types.string, ServerConfigIds.emailHost),
            port: this.serviceFactory.getInstance(Types.number, ServerConfigIds.emailPort),
            authUser: this.serviceFactory.getInstance(Types.string, ServerConfigIds.emailAuthUser),
            authPassword: this.serviceFactory.getInstance(Types.string, ServerConfigIds.emailAuthPassword)
        };

        this.serviceFactory.mapToValue(Types.ServiceConfig, emailConfig);

        this._email = this.getServiceInstance(Types.IEmailService);

        this.addModel(this._email);
    }

    public override createChildContexts(): IMainContext
    {
        this._authContext = this.getContextInstance(Types.IServerAuthContext);

        this.map(AppContextMessageType.READY, InitializationCompleteCommand).addTargetGuards(this._authContext);

        this.addModel(this._authContext);

        return this;
    }

    public get db(): IAuthDataBaseService
    {
        return this._db;
    }

    public get email(): IEmailService
    {
        return this._email;
    }

    public get socket(): ISocketServerService
    {
        return this._socket;
    }

    public get http(): IHttpServerService
    {
        return this._http;
    }

    public get authContext(): IServerAuthContext
    {
        return this._authContext;
    }
}

setDefaultImplementation<IServerMainContext>(Types.IServerMainContext, ServerMainContext);