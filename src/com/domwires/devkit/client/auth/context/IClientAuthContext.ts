import {AppContext, IAppContext, IAppContextImmutable} from "../../../common/app/context/IAppContext";
import {Types} from "../../../common/Types";
import {inject} from "inversify";
import {IAccountModelContainer} from "../../../common/main/model/IAccountModelContainer";
import {INetClientService, NetClientServiceMessageType} from "../../common/service/net/INetClientService";
import {Class, ICommand, IFactory, setDefaultImplementation} from "domwires";
import {IInputView} from "../../../common/app/view/IInputView";
import {BrowserConsoleInputView} from "../../main/view/BrowserConsoleInputView";
import {registerCommandAlias} from "../../../common/Global";
import {LoginCommand} from "../command/req/LoginCommand";
import {RegisterResponseCommand} from "../command/res/RegisterResponseCommand";
import {RegisterCommand} from "../command/req/RegisterCommand";
import {SocketAction} from "../../../common/net/SocketAction";
import {IAccountModel} from "../../../common/main/model/IAccountModel";
import {IsSuitableActionGuards} from "../../common/command/guards/IsSuitableActionGuards";
import {LoginResponseCommand} from "../command/res/LoginResponseCommand";
import {GuestLoginCommand} from "../command/req/GuestLoginCommand";
import {GuestLoginResponseCommand} from "../command/res/GuestLoginResponseCommand";
import {LogoutCommand} from "../command/req/LogoutCommand";
import {ResetPasswordResponseCommand} from "../command/res/ResetPasswordResponseCommand";
import {ResetPasswordCommand} from "../command/req/ResetPasswordCommand";
import {UpdatePasswordResponseCommand} from "../command/res/UpdatePasswordResponseCommand";
import {UpdateAccountDataResponseCommand} from "../command/res/UpdateAccountDataResponseCommand";
import {UpdateEmailResponseCommand} from "../command/res/UpdateEmailResponseCommand";
import {DeleteAccountResponseCommand} from "../command/res/DeleteAccountResponseCommand";
import {UpdateAccountDataCommand} from "../command/req/UpdateAccountDataCommand";
import {UpdateEmailCommand} from "../command/req/UpdateEmailCommand";
import {UpdatePasswordCommand} from "../command/req/UpdatePasswordCommand";
import {DeleteAccountCommand} from "../command/req/DeleteAccountCommand";
import {ISignUpMediator} from "../mediator/ISignUpMediator";
import {LitSignUpMediator} from "../mediator/LitSignUpMediator";
// import {ISignUpView} from "../view/AbstractLitSignUpView";
// import {SignUpView} from "../../../../../../../example/client/view/SignUpView";

export interface IClientAuthContextImmutable extends IAppContextImmutable
{

}

export interface IClientAuthContext extends IClientAuthContextImmutable, IAppContext
{

}

export class ClientAuthContext extends AppContext implements IAppContext
{
    @inject(Types.INetClientService)
    private netClient!: INetClientService;

    @inject(Types.IAccountModelContainer)
    private accounts!: IAccountModelContainer;

    @inject(Types.IAccountModel)
    private account!: IAccountModel;

    protected override get defaultUIViewClass(): Class<IInputView>
    {
        return BrowserConsoleInputView;
    }

    protected override init(): void
    {
        this.setId("auth");

        super.init();

        this.factory.mapToValue(Types.IClientAuthContext, this);

        this.factory.mapToValue(Types.INetClientService, this.netClient);
        this.factory.mapToValue(Types.IAccountModel, this.account);

        this.addMediator(this.getMediatorInstance(Types.ISignUpMediator));

        this.registerCommandAliases();

        this.mapToResponseCommand(SocketAction.REGISTER, RegisterResponseCommand);
        this.mapToResponseCommand(SocketAction.LOGIN, LoginResponseCommand);
        this.mapToResponseCommand(SocketAction.GUEST_LOGIN, GuestLoginResponseCommand);
        this.mapToResponseCommand(SocketAction.RESET_PASSWORD, ResetPasswordResponseCommand);
        this.mapToResponseCommand(SocketAction.UPDATE_PASSWORD, UpdatePasswordResponseCommand);
        this.mapToResponseCommand(SocketAction.UPDATE_ACCOUNT_DATA, UpdateAccountDataResponseCommand);
        this.mapToResponseCommand(SocketAction.UPDATE_EMAIL, UpdateEmailResponseCommand);
        this.mapToResponseCommand(SocketAction.DELETE_ACCOUNT, DeleteAccountResponseCommand);

        setTimeout(this.ready.bind(this), 100);
    }

    protected override createFactories(): { contextFactory: IFactory; modelFactory: IFactory; serviceFactory: IFactory; mediatorFactory: IFactory; viewFactory: IFactory }
    {
        const factories = super.createFactories();

        factories.mediatorFactory.mapToType<ISignUpMediator>(Types.ISignUpMediator, LitSignUpMediator);
        // factories.viewFactory.mapToType<ISignUpView>(Types.ISignUpView, SignUpView);

        return factories;
    }

    private mapToResponseCommand(responseAction: SocketAction, command: Class<ICommand>): void
    {
        this.map<SocketResponseActionData>(NetClientServiceMessageType.TCP_RESPONSE, command,
            {responseAction: responseAction}).addTargetGuards(this.netClient).addGuards(IsSuitableActionGuards);
    }

    private registerCommandAliases(): void
    {
        registerCommandAlias(RegisterCommand, "register", "register user", [
            {name: "email", type: Types.empty},
            {name: "password", type: Types.empty},
            {name: "nickname", type: Types.empty}
        ]);

        registerCommandAlias(LoginCommand, "login", "login user", [
            {name: "email", type: Types.empty},
            {name: "password", type: Types.empty}
        ]);

        registerCommandAlias(GuestLoginCommand, "guest_login", "login guest user");

        registerCommandAlias(LogoutCommand, "logout", "logout user");

        registerCommandAlias(ResetPasswordCommand, "reset_password", "reset password", [
            {name: "email", type: Types.empty}
        ]);

        registerCommandAlias(UpdateAccountDataCommand, "update_account_data", "update account data", [
            {name: "nick", type: Types.empty}
        ]);

        registerCommandAlias(UpdateEmailCommand, "update_email", "update email", [
            {name: "email", type: Types.empty}
        ]);

        registerCommandAlias(UpdatePasswordCommand, "update_password", "update password", [
            {name: "oldPassword", type: Types.empty},
            {name: "newPassword", type: Types.empty}
        ]);

        registerCommandAlias(DeleteAccountCommand, "delete_account", "delete account");
    }
}

type SocketResponseActionData = {
    readonly responseAction: SocketAction;
};

setDefaultImplementation<IClientAuthContext>(Types.IClientAuthContext, ClientAuthContext);