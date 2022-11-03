import "../../auth/context/IServerAuthContext";
import "../../../common/main/model/IAccountModelContainer";

import {AppContextMessageType} from "../../../common/app/context/IAppContext";
import {IInputView} from "../../../common/app/view/IInputView";
import {Class, setDefaultImplementation} from "domwires";
import {CliInputView} from "../view/CliInputView";
import {IHttpServerService} from "../../common/service/net/http/IHttpServerService";
import {ISocketServerService, SocketServerServiceConfig} from "../../common/service/net/socket/ISocketServerService";
import {ExpressHttpServerService} from "../../common/service/net/http/impl/ExpressHttpServerService";
import {SioSocketServerService} from "../../common/service/net/socket/impl/SioSocketServerService";
import {NetServerServiceConfig, NetServerServiceMessageType} from "../../common/service/net/INetServerService";
import {DataBaseServiceConfig, IDataBaseService} from "../../common/service/net/db/IDataBaseService";
import {Types} from "../../../common/Types";
import {MongoDataBaseService} from "../../common/service/net/db/impl/MongoDataBaseService";
import {OpenServiceCommand} from "../command/OpenServiceCommand";
import {CreateChildContextsCommand} from "../../../common/main/command/CreateChildContextsCommand";
import {CloseServiceCommand} from "../command/CloseServiceCommand";
import {ShutDownCompleteCommand} from "../../../common/main/command/ShutDownCompleteCommand";
import {InitializationCompleteCommand} from "../../../common/main/command/InitializationCompleteCommand";
import {ConfigIds} from "../../../common/ConfigIds";
import {ServerConfigIds} from "../../ServerConfigIds";
import {AbstractMainContext, IMainContext, IMainContextImmutable} from "../../../common/main/context/IMainContext";
import {IServerAuthContext} from "../../auth/context/IServerAuthContext";

export interface IServerMainContextImmutable extends IMainContextImmutable
{

}

export interface IServerMainContext extends IServerMainContextImmutable, IMainContext
{
    createChildContexts(): IServerMainContext;

    shutDownComplete(): IServerMainContext;

    initializationComplete(): IServerMainContext;
}

export class ServerMainContext extends AbstractMainContext implements IServerMainContext
{
    private authContext!: IServerAuthContext;

    private http!: IHttpServerService;
    private socket!: ISocketServerService;
    private db!: IDataBaseService;

    protected override init()
    {
        super.init();

        this.mapServiceToType(Types.IHttpServerService, ExpressHttpServerService);
        this.mapServiceToType(Types.ISocketServerService, SioSocketServerService);
        this.mapServiceToType(Types.IDataBaseService, MongoDataBaseService);

        this.createHttp();
        this.createSocket();
        this.createDb();

        this.map(NetServerServiceMessageType.OPEN_SUCCESS, OpenServiceCommand, {service: this.socket}).addTargetGuards(this.http);
        this.map(NetServerServiceMessageType.OPEN_SUCCESS, OpenServiceCommand, {service: this.db}).addTargetGuards(this.socket);
        this.map(NetServerServiceMessageType.OPEN_SUCCESS, CreateChildContextsCommand).addTargetGuards(this.db);

        this.map([NetServerServiceMessageType.CLOSE_SUCCESS, NetServerServiceMessageType.CLOSE_FAIL],
            CloseServiceCommand, {service: this.socket}).addTargetGuards(this.db);

        this.map([NetServerServiceMessageType.CLOSE_SUCCESS, NetServerServiceMessageType.CLOSE_FAIL],
            CloseServiceCommand, {service: this.http}).addTargetGuards(this.socket);

        this.map([NetServerServiceMessageType.CLOSE_SUCCESS, NetServerServiceMessageType.CLOSE_FAIL],
            ShutDownCompleteCommand).addTargetGuards(this.http);

        this.executeCommand(OpenServiceCommand, {service: this.http});
    }

    public override dispose(): void
    {
        this.executeCommand(CloseServiceCommand, {service: this.db});
    }

    protected override get defaultUIViewClass(): Class<IInputView>
    {
        return CliInputView;
    }

    private createHttp(): void
    {
        const netHost: string = this.modelFactory.getInstance(Types.string, ConfigIds.netHost);
        const httpPort: number = this.modelFactory.getInstance(Types.number, ConfigIds.httpPort);

        const httpConfig: NetServerServiceConfig = {host: netHost, port: httpPort};

        this.serviceFactory.mapToValue(Types.ServiceConfig, httpConfig);

        this.http = this.getServiceInstance(Types.IHttpServerService);

        this.addModel(this.http);
    }

    private createSocket(): void
    {
        const socketConfig: SocketServerServiceConfig = {
            enabled: this.http.enabled,
            host: this.http.host,
            port: this.modelFactory.getInstance(Types.number, ConfigIds.socketPort),
            http: this.http.nodeHttpServer
        };

        this.serviceFactory.mapToValue(Types.ServiceConfig, socketConfig);

        this.socket = this.getServiceInstance(Types.ISocketServerService);

        this.addModel(this.socket);
    }

    private createDb(): void
    {
        const dbConfig: DataBaseServiceConfig = {
            host: this.modelFactory.getInstance(Types.string, ServerConfigIds.dbHost),
            port: this.modelFactory.getInstance(Types.number, ServerConfigIds.dbPort),
            dataBaseName: this.modelFactory.getInstance(Types.string, ServerConfigIds.dbName),
        };

        this.serviceFactory.mapToValue(Types.ServiceConfig, dbConfig);

        this.db = this.getServiceInstance(Types.IDataBaseService);

        this.addModel(this.db);
    }

    public override createChildContexts(): IMainContext
    {
        this.authContext = this.getContextInstance(Types.IServerAuthContext);

        this.map(AppContextMessageType.READY, InitializationCompleteCommand).addTargetGuards(this.authContext);

        this.addModel(this.authContext);

        return this;
    }
}

setDefaultImplementation<IServerMainContext>(Types.IServerMainContext, ServerMainContext);