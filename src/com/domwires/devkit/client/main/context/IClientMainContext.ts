import "../../auth/context/IClientAuthContext";
import "../../../common/main/model/IAccountModel";
import "../../../common/main/model/IAccountModelContainer";

import {IInputView} from "../../../common/app/view/IInputView";
import {Class, setDefaultImplementation} from "domwires";
import {BrowserConsoleInputView} from "../view/BrowserConsoleInputView";
import {Types} from "../../../common/Types";
import {
    INetClientService,
    NetClientServiceConfig,
    NetClientServiceMessageType
} from "../../common/service/net/INetClientService";
import {AxiosSioNetClientService} from "../../common/service/net/impl/AxiosSioNetClientService";
import {ConfigIds} from "../../../common/ConfigIds";
import {ServiceMessageType} from "../../../common/service/IService";
import {ConnectNetClientServiceCommand} from "../command/ConnectNetClientServiceCommand";
import {AbstractMainContext, IMainContext, IMainContextImmutable} from "../../../common/main/context/IMainContext";
import {CreateChildContextsCommand} from "../../../common/main/command/CreateChildContextsCommand";
import {AppContextMessageType} from "../../../common/app/context/IAppContext";
import {InitializationCompleteCommand} from "../../../common/main/command/InitializationCompleteCommand";
import {IClientAuthContext} from "../../auth/context/IClientAuthContext";
import {InitNetClientServiceCommand} from "../command/InitNetClientServiceCommand";
import {AuthContextNotExistGuards} from "../command/guards/AuthContextNotExistGuards";
import {IAccountModel} from "../../../common/main/model/IAccountModel";

export interface IClientMainContextImmutable extends IMainContextImmutable
{
}

export interface IClientMainContext extends IClientMainContextImmutable, IMainContext
{
    get authContext(): IClientAuthContext;

    get netClient(): INetClientService;

    get account(): IAccountModel;
}

export class ClientMainContext extends AbstractMainContext implements IClientMainContext
{
    private _authContext!: IClientAuthContext;

    private _netClient!: INetClientService;

    private _account!: IAccountModel;

    protected override get defaultUIViewClass(): Class<IInputView>
    {
        return BrowserConsoleInputView;
    }

    protected override init(): void
    {
        super.init();

        this.mapServiceToType(Types.INetClientService, AxiosSioNetClientService);

        this.createNetClient();
        this.createUserAccount();

        this.map(ServiceMessageType.INIT_SUCCESS, ConnectNetClientServiceCommand).addTargetGuards(this._netClient);

        this.map(NetClientServiceMessageType.CONNECTED, CreateChildContextsCommand).addTargetGuards(this._netClient)
            .addGuards(AuthContextNotExistGuards);

        this.map(NetClientServiceMessageType.DISCONNECTED, ConnectNetClientServiceCommand).addTargetGuards(this._netClient);

        this.executeCommand(InitNetClientServiceCommand);
    }

    public override createChildContexts(): IMainContext
    {
        this._authContext = this.getContextInstance(Types.IClientAuthContext);

        this.map(AppContextMessageType.READY, InitializationCompleteCommand).addTargetGuards(this._authContext);

        this.addModel(this._authContext);

        return this;
    }

    private createNetClient(): void
    {
        const netHost: string = this.modelFactory.getInstance(Types.string, ConfigIds.netHost);
        const httpPort: number = this.modelFactory.getInstance(Types.number, ConfigIds.httpPort);
        const socketPort: number = this.modelFactory.getInstance(Types.number, ConfigIds.socketPort);

        const config: NetClientServiceConfig = {
            httpBaseUrl: "http://" + netHost + ":" + httpPort,
            socketUri: "ws://" + netHost + ":" + socketPort
        };

        this.serviceFactory.mapToValue(Types.ServiceConfig, config);

        this._netClient = this.getServiceInstance(Types.INetClientService);

        this.addModel(this._netClient);
    }

    private createUserAccount(): void
    {
        this._account = this.getModelInstance(Types.IAccountModel);

        this.addModel(this._account);
    }

    public get netClient(): INetClientService
    {
        return this._netClient;
    }

    public get authContext(): IClientAuthContext
    {
        return this._authContext;
    }

    public get account(): IAccountModel
    {
        return this._account;
    }
}

setDefaultImplementation<IClientMainContext>(Types.IClientMainContext, ClientMainContext);