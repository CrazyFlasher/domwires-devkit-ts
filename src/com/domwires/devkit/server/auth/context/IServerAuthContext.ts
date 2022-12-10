import "../../../common/main/model/IAccountModel";

import {AppContext, IAppContext, IAppContextImmutable} from "../../../common/app/context/IAppContext";
import {inject} from "inversify";
import {
    ISocketServerService,
    SocketServerServiceMessageType
} from "../../common/service/net/socket/ISocketServerService";
import {NetServerServiceMessageType} from "../../common/service/net/INetServerService";
import {SocketAction} from "../../../common/net/SocketAction";
import {CreateAccountModelCommand} from "../command/internal/CreateAccountModelCommand";
import {RemoveAccountModelCommand} from "../command/internal/RemoveAccountModelCommand";
import {Types} from "../../../common/Types";
import {MapContextCommandsCommand} from "../command/internal/MapContextCommandsCommand";
import {Class, setDefaultImplementation} from "domwires";
import {IInputView} from "../../../common/app/view/IInputView";
import {CliInputView} from "../../main/view/CliInputView";
import {IsSuitableSocketActionGuards} from "../command/guards/IsSuitableSocketActionGuards";
import {IAccountModelContainer} from "../../../common/main/model/IAccountModelContainer";
import {
    EmptyRequestValidator,
    LoginValidator,
    RegisterValidator,
    ResetPasswordValidator,
    TokenValidator,
    UpdateAccountDataValidator,
    UpdateEmailValidator,
    UpdatePasswordValidator
} from "./RequestDataValidators";
import {CreateDataBaseCollectionsCommand} from "../command/internal/CreateDataBaseCollectionsCommand";
import {IEmailService} from "../../common/service/net/email/IEmailService";
import {IHttpServerService} from "../../common/service/net/http/IHttpServerService";
import {HttpAction} from "../../../common/net/HttpAction";
import {AuthDataBaseServiceMessageType, IAuthDataBaseService} from "../../common/service/net/db/IAuthDataBaseService";
import {RegisterCommand} from "../command/clientRequest/RegisterCommand";
import {LoginCommand} from "../command/clientRequest/LoginCommand";
import {GuestLoginCommand} from "../command/clientRequest/GuestLoginCommand";
import {LogoutCommand} from "../command/clientRequest/LogoutCommand";
import {ResetPasswordCommand} from "../command/clientRequest/ResetPasswordCommand";
import {ConfirmResetPasswordCommand} from "../command/clientRequest/ConfirmResetPasswordCommand";
import {IsSuitableHttpActionGuards} from "../command/guards/IsSuitableHttpActionGuards";
import {UpdatePasswordCommand} from "../command/clientRequest/UpdatePasswordCommand";
import {UpdateAccountDataCommand} from "../command/clientRequest/UpdateAccountDataCommand";
import {UpdateEmailCommand} from "../command/clientRequest/UpdateEmailCommand";
import {ConfirmUpdateEmailCommand} from "../command/clientRequest/ConfirmUpdateEmailCommand";
import {DeleteAccountCommand} from "../command/clientRequest/DeleteAccountCommand";
import {ConfirmDeleteAccountCommand} from "../command/clientRequest/ConfirmDeleteAccountCommand";
import {registerCommandAlias} from "../../../common/Global";

export interface IServerAuthContextImmutable extends IAppContextImmutable
{

}

export interface IServerAuthContext extends IServerAuthContextImmutable, IAppContext
{
    mapCommands(): IAppContext;
}

export class ServerAuthContext extends AppContext implements IServerAuthContext
{
    @inject(Types.IHttpServerService)
    private http!: IHttpServerService;

    @inject(Types.ISocketServerService)
    private socket!: ISocketServerService;

    @inject(Types.IAuthDataBaseService)
    private db!: IAuthDataBaseService;

    @inject(Types.IEmailService)
    private email!: IEmailService;

    @inject(Types.IAccountModelContainer)
    private accounts!: IAccountModelContainer;

    protected override init(): void
    {
        this.setId("auth");

        super.init();

        this.factory.mapToValue(Types.IServerAuthContext, this);

        this.factory.mapToValue(Types.ISocketServerService, this.socket);
        this.factory.mapToValue(Types.IAuthDataBaseService, this.db);
        this.factory.mapToValue(Types.IAccountModelContainer, this.accounts);
        this.factory.mapToValue(Types.IEmailService, this.email);
        this.factory.mapToValue(Types.IHttpServerService, this.http);

        this.socket.startListen([
            {action: SocketAction.REGISTER, validator: new RegisterValidator()},
            {action: SocketAction.LOGIN, validator: new LoginValidator()},
            {action: SocketAction.GUEST_LOGIN, validator: new EmptyRequestValidator()},
            {action: SocketAction.LOGOUT, validator: new EmptyRequestValidator()},
            {action: SocketAction.RESET_PASSWORD, validator: new ResetPasswordValidator()},
            {action: SocketAction.UPDATE_PASSWORD, validator: new UpdatePasswordValidator()},
            {action: SocketAction.UPDATE_ACCOUNT_DATA, validator: new UpdateAccountDataValidator()},
            {action: SocketAction.UPDATE_EMAIL, validator: new UpdateEmailValidator()},
            {action: SocketAction.DELETE_ACCOUNT, validator: new EmptyRequestValidator()}
        ]);

        this.http.startListen([
            {action: HttpAction.CONFIRM_RESET_PASSWORD, validator: new TokenValidator()},
            {action: HttpAction.CONFIRM_UPDATE_EMAIL, validator: new TokenValidator()},
            {action: HttpAction.CONFIRM_DELETE_ACCOUNT, validator: new TokenValidator()}
        ]);

        this.map(AuthDataBaseServiceMessageType.COLLECTIONS_CREATE_SUCCESS, MapContextCommandsCommand);

        this.executeCommand(CreateDataBaseCollectionsCommand);
    }

    protected override get defaultUIViewClass(): Class<IInputView>
    {
        return CliInputView;
    }

    public mapCommands(): IAppContext
    {
        this.registerCommandAliases();

        this.map(SocketServerServiceMessageType.CLIENT_CONNECTED, CreateAccountModelCommand);
        this.map(SocketServerServiceMessageType.CLIENT_DISCONNECTED, RemoveAccountModelCommand);

        this.mapRegisterCommand();
        this.mapLoginCommand();
        this.mapGuestLoginCommand();
        this.mapLogoutCommand();
        this.mapResetPasswordCommand();
        this.mapConfirmResetPasswordCommand();
        this.mapUpdatePasswordCommand();
        this.mapUpdateAccountDataCommand();
        this.mapUpdateEmailCommand();
        this.mapConfirmUpdateEmailCommand();
        this.mapDeleteAccountCommand();
        this.mapConfirmDeleteAccountCommand();

        this.ready();

        return this;
    }

    private registerCommandAliases(): void
    {
        registerCommandAlias(RegisterCommand, "register", "register user", [
            {name: "clientId"},
            {name: "dto", requiredValue: {email: Types.empty, password: Types.empty, nick: Types.empty}}
        ]);

        registerCommandAlias(LoginCommand, "login", "login user", [
            {name: "clientId"},
            {name: "dto", requiredValue: {email: Types.empty, password: Types.empty}}
        ]);

        registerCommandAlias(LogoutCommand, "logout", "logout user", [
            {name: "clientId"}
        ]);

        registerCommandAlias(GuestLoginCommand, "guest_login", "login as guest user", [
            {name: "clientId"}
        ]);
    }

    private mapRegisterCommand(): void
    {
        this.map<SocketActionData>(NetServerServiceMessageType.GOT_REQUEST, RegisterCommand,
            {requiredAction: SocketAction.REGISTER}
        ).addGuards(IsSuitableSocketActionGuards);
    }

    private mapLoginCommand(): void
    {
        this.map<SocketActionData>(NetServerServiceMessageType.GOT_REQUEST, LoginCommand,
            {requiredAction: SocketAction.LOGIN}
        ).addGuards(IsSuitableSocketActionGuards);
    }

    private mapGuestLoginCommand(): void
    {
        this.map<SocketActionData>(NetServerServiceMessageType.GOT_REQUEST, GuestLoginCommand,
            {requiredAction: SocketAction.GUEST_LOGIN,}
        ).addGuards(IsSuitableSocketActionGuards);
    }

    private mapLogoutCommand(): void
    {
        this.map<SocketActionData>(NetServerServiceMessageType.GOT_REQUEST, LogoutCommand,
            {requiredAction: SocketAction.LOGOUT}
        ).addGuards(IsSuitableSocketActionGuards);
    }

    private mapResetPasswordCommand(): void
    {
        this.map<SocketActionData>(NetServerServiceMessageType.GOT_REQUEST, ResetPasswordCommand,
            {requiredAction: SocketAction.RESET_PASSWORD}
        ).addGuards(IsSuitableSocketActionGuards).addTargetGuards(this.socket);
    }

    private mapConfirmResetPasswordCommand(): void
    {
        this.map<HttpActionData>(NetServerServiceMessageType.GOT_REQUEST, ConfirmResetPasswordCommand,
            {requiredAction: HttpAction.CONFIRM_RESET_PASSWORD}
        ).addGuards(IsSuitableHttpActionGuards);
    }

    private mapUpdatePasswordCommand(): void
    {
        this.map<SocketActionData>(NetServerServiceMessageType.GOT_REQUEST, UpdatePasswordCommand,
            {requiredAction: SocketAction.UPDATE_PASSWORD}
        ).addGuards(IsSuitableSocketActionGuards);
    }

    private mapUpdateAccountDataCommand(): void
    {
        this.map<SocketActionData>(NetServerServiceMessageType.GOT_REQUEST, UpdateAccountDataCommand,
            {requiredAction: SocketAction.UPDATE_ACCOUNT_DATA}
        ).addGuards(IsSuitableSocketActionGuards);
    }

    private mapUpdateEmailCommand(): void
    {
        this.map<SocketActionData>(NetServerServiceMessageType.GOT_REQUEST, UpdateEmailCommand,
            {requiredAction: SocketAction.UPDATE_EMAIL}
        ).addGuards(IsSuitableSocketActionGuards).addTargetGuards(this.socket);
    }

    private mapConfirmUpdateEmailCommand(): void
    {
        this.map<HttpActionData>(NetServerServiceMessageType.GOT_REQUEST, ConfirmUpdateEmailCommand,
            {requiredAction: HttpAction.CONFIRM_UPDATE_EMAIL}
        ).addGuards(IsSuitableHttpActionGuards);
    }

    private mapDeleteAccountCommand(): void
    {
        this.map<SocketActionData>(NetServerServiceMessageType.GOT_REQUEST, DeleteAccountCommand,
            {requiredAction: SocketAction.DELETE_ACCOUNT}
        ).addGuards(IsSuitableSocketActionGuards).addTargetGuards(this.socket);
    }

    private mapConfirmDeleteAccountCommand(): void
    {
        this.map<HttpActionData>(NetServerServiceMessageType.GOT_REQUEST, ConfirmDeleteAccountCommand,
            {requiredAction: HttpAction.CONFIRM_DELETE_ACCOUNT}
        ).addGuards(IsSuitableHttpActionGuards);
    }
}

type SocketActionData = {
    requiredAction: SocketAction;
};

type HttpActionData = {
    requiredAction: HttpAction;
};

setDefaultImplementation<IServerAuthContext>(Types.IServerAuthContext, ServerAuthContext);