/* eslint-disable @typescript-eslint/no-empty-interface */

import "../../auth/context/IAuthContext";

import {
    AppContext,
    AppContextMessageType,
    IAppContext,
    IAppContextImmutable
} from "../../../common/context/IAppContext";
import {IInputView} from "../../../common/view/IInputView";
import {Class, IFactory, MessageType, setDefaultImplementation} from "domwires";
import {CliInputView} from "../view/CliInputView";
import {IHttpServerService} from "../../common/service/net/http/IHttpServerService";
import {ISocketServerService, SocketServerServiceConfig} from "../../common/service/net/socket/ISocketServerService";
import {IAccountModel} from "../../../common/model/IAccountModel";
import {ExpressHttpServerService} from "../../common/service/net/http/impl/ExpressHttpServerService";
import {SioSocketServerService} from "../../common/service/net/socket/impl/SioSocketServerService";
import {NetServerServiceConfig, NetServerServiceMessageType} from "../../common/service/net/INetServerService";
import {DataBaseServiceConfig, IDataBaseService} from "../../common/service/net/db/IDataBaseService";
import {Types} from "../../../common/Types";
import {ConfigIds} from "../../ConfigIds";
import {MongoDataBaseService} from "../../common/service/net/db/impl/MongoDataBaseService";
import {CloseServicesCommand} from "../command/CloseServicesCommand";
import {TargetIsHttpServiceGuards} from "../command/guards/TargetIsHttpServiceGuards";
import {OpenServiceCommand} from "../command/OpenServiceCommand";
import {TargetIsSocketServiceGuards} from "../command/guards/TargetIsSocketServiceGuards";
import {CreateChildContextsCommand} from "../command/CreateChildContextsCommand";
import {IAuthContext} from "../../auth/context/IAuthContext";
import {TargetIsDataBaseServiceGuards} from "../command/guards/TargetIsDataBaseServiceGuards";

export class ServerAppContextMessageType extends MessageType
{
    public static readonly DISPOSED: ServerAppContextMessageType = new ServerAppContextMessageType();
    public static readonly INITIALIZED: ServerAppContextMessageType = new ServerAppContextMessageType();
}

export interface IServerAppContextImmutable extends IAppContextImmutable
{

}

export interface IServerAppContext extends IServerAppContextImmutable, IAppContext
{
    createChildContexts(): IServerAppContext;
}

export class ServerAppContext extends AppContext implements IServerAppContext
{
    private contextFactory!: IFactory;
    private modelFactory!: IFactory;
    private serviceFactory!: IFactory;

    private http!: IHttpServerService;
    private socket!: ISocketServerService;
    private db!: IDataBaseService;

    private accountModelMap = new Map<string, IAccountModel>();

    protected override init()
    {
        super.init();

        this.factory.mapToValue(Types.IServerAppContext, this);

        this.contextFactory.mapToValue("Map<string, IAccountModel>", this.accountModelMap);

        this.mapServiceToType(Types.IHttpServerService, ExpressHttpServerService);
        this.mapServiceToType(Types.ISocketServerService, SioSocketServerService);
        this.mapServiceToType(Types.IDataBaseService, MongoDataBaseService);

        this.createHttp();
        this.createSocket();
        this.createDb();

        this.map(NetServerServiceMessageType.OPEN_SUCCESS, OpenServiceCommand, {service: this.socket}).addGuards(TargetIsHttpServiceGuards);
        this.map(NetServerServiceMessageType.OPEN_SUCCESS, OpenServiceCommand, {service: this.db}).addGuards(TargetIsSocketServiceGuards);
        this.map(NetServerServiceMessageType.OPEN_SUCCESS, CreateChildContextsCommand).addGuards(TargetIsDataBaseServiceGuards);

        this.executeCommand(OpenServiceCommand, {service: this.http});

        // await this.executeCommand(OpenServiceCommand, {service: this.http});
        // await this.executeCommand(OpenServiceCommand, {service: this.socket});
        // await this.executeCommand(OpenDataBaseServiceCommand, {service: this.db});

        // this.executeCommand(CreateChildContextsCommand);
    }

    public override async dispose()
    {
        await this.executeCommand(CloseServicesCommand);

        this.disposeComplete();
    }

    private disposeComplete(): void
    {
        this.dispatchMessage(ServerAppContextMessageType.DISPOSED);

        super.dispose();
    }

    protected override createFactories(): {
        contextFactory: IFactory; modelFactory: IFactory; serviceFactory: IFactory;
        mediatorFactory: IFactory; viewFactory: IFactory;
    }
    {
        const result = super.createFactories();

        this.contextFactory = result.contextFactory;
        this.modelFactory = result.modelFactory;
        this.serviceFactory = result.serviceFactory;

        return result;
    }

    protected override get defaultUIViewClass(): Class<IInputView>
    {
        return CliInputView;
    }

    private createHttp(): void
    {
        const netEnabled: boolean = this.modelFactory.getInstance(Types.boolean, ConfigIds.netEnabled);
        const netHost: string = this.modelFactory.getInstance(Types.string, ConfigIds.netHost);
        const httpPort: number = this.modelFactory.getInstance(Types.number, ConfigIds.httpPort);

        const httpConfig: NetServerServiceConfig = {enabled: netEnabled, host: netHost, port: httpPort};

        this.serviceFactory.mapToValue(Types.ServiceConfig, httpConfig);
        this.serviceFactory.mapToValue(Types.NetServerServiceConfig, httpConfig);

        this.http = this.getService(Types.IHttpServerService);

        this.add(this.http);
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
        this.serviceFactory.mapToValue(Types.NetServerServiceConfig, socketConfig);
        this.serviceFactory.mapToValue(Types.SocketServerServiceConfig, socketConfig);

        this.socket = this.getService(Types.ISocketServerService);

        this.add(this.socket);
    }

    private createDb(): void
    {
        const dbConfig: DataBaseServiceConfig = {
            host: this.modelFactory.getInstance(Types.string, ConfigIds.dbHost),
            port: this.modelFactory.getInstance(Types.number, ConfigIds.dbPort),
            dataBaseName: this.modelFactory.getInstance(Types.string, ConfigIds.dbName),
        };

        this.serviceFactory.mapToValue(Types.ServiceConfig, dbConfig);
        this.serviceFactory.mapToValue(Types.NetServerServiceConfig, dbConfig);
        this.serviceFactory.mapToValue(Types.DataBaseServiceConfig, dbConfig);

        this.db = this.getService(Types.IDataBaseService);

        this.add(this.db);
    }

    public createChildContexts(): IServerAppContext
    {
        const authContext = this.contextFactory.getInstance<IAuthContext>(Types.IAuthContext);

        authContext.addMessageListener(AppContextMessageType.READY, () =>
        {
            this.dispatchMessage(ServerAppContextMessageType.INITIALIZED);
        });

        this.add(authContext);

        return this;
    }
}

setDefaultImplementation<IServerAppContext>(Types.IServerAppContext, ServerAppContext);