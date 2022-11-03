import "../../auth/IClientAuthContext";

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
import {IClientAuthContext} from "../../auth/IClientAuthContext";
import {InitNetClientServiceCommand} from "../command/InitNetClientServiceCommand";

export interface IClientMainContextImmutable extends IMainContextImmutable
{
}

export interface IClientMainContext extends IClientMainContextImmutable, IMainContext
{
}

export class ClientMainContext extends AbstractMainContext implements IClientMainContext
{
    private authContext!: IClientAuthContext;

    private netClient!: INetClientService;

    protected override get defaultUIViewClass(): Class<IInputView>
    {
        return BrowserConsoleInputView;
    }

    protected override init(): void
    {
        super.init();

        this.mapServiceToType(Types.INetClientService, AxiosSioNetClientService);

        this.createNetClient();

        this.map(ServiceMessageType.INIT_SUCCESS, ConnectNetClientServiceCommand).addTargetGuards(this.netClient);
        this.map(NetClientServiceMessageType.CONNECTED, CreateChildContextsCommand).addTargetGuards(this.netClient);

        this.executeCommand(InitNetClientServiceCommand);
    }

    public override createChildContexts(): IMainContext
    {
        this.authContext = this.getContextInstance(Types.IClientAuthContext);

        this.map(AppContextMessageType.READY, InitializationCompleteCommand).addTargetGuards(this.authContext);

        this.addModel(this.authContext);

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

        this.netClient = this.getServiceInstance(Types.INetClientService);

        this.addModel(this.netClient);
    }
}

setDefaultImplementation<IClientMainContext>(Types.IClientMainContext, ClientMainContext);