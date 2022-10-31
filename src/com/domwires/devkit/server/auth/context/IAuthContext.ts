/* eslint-disable @typescript-eslint/no-empty-interface */

import "../../../common/model/IAccountModel";

import {AppContext, IAppContext, IAppContextImmutable} from "../../../common/context/IAppContext";
import {inject} from "inversify";
import {
    ISocketServerService,
    SocketServerServiceMessageType
} from "../../common/service/net/socket/ISocketServerService";
import {NetServerServiceMessageType} from "../../common/service/net/INetServerService";
import {SocketAction} from "../../../common/net/SocketAction";
import {AddAccountToMapCommand} from "../command/AddAccountToMapCommand";
import {RemoveAccountFromMapCommand} from "../command/RemoveAccountFromMapCommand";
import {Types} from "../../../common/Types";
import {DataBaseServiceMessageType, IDataBaseService} from "../../common/service/net/db/IDataBaseService";
import {InitUsersTableCommand} from "../command/InitUsersTableCommand";
import {MapContextCommandsCommand} from "../command/MapContextCommandsCommand";
import {Class, setDefaultImplementation} from "domwires";
import {RegisterCommand} from "../command/account/RegisterCommand";
import {LoginCommand} from "../command/account/LoginCommand";
import {IsLoginPasswordMatchesGuards} from "../command/guards/query/IsLoginPasswordMatchesGuards";
import {registerCommandAlias} from "../../../common/Global";
import {IInputView} from "../../../common/view/IInputView";
import {CliInputView} from "../../main/view/CliInputView";
import {ErrorReason} from "../../../common/ErrorReason";
import {ResultDto} from "../../../common/net/dto/Dto";
import {UpdateAccountSnapshotCommand} from "../command/account/UpdateAccountSnapshotCommand";
import {IsSuitableActionGuards} from "../command/guards/socket/IsSuitableActionGuards";
import {IsSuitableQueryGuards} from "../command/guards/query/IsSuitableQueryGuards";
import {LogoutCommand} from "../command/account/LogoutCommand";
import {ResponseCommand} from "../command/response/ResponseCommand";
import {IAccountModelContainer} from "../../../common/model/IAccountModelContainer";

export interface IAuthContextImmutable extends IAppContextImmutable
{

}

export interface IAuthContext extends IAuthContextImmutable, IAppContext
{
    mapCommands(): IAppContext;
}

export class AuthContext extends AppContext implements IAuthContext
{
    @inject(Types.ISocketServerService)
    private socket!: ISocketServerService;

    @inject(Types.IDataBaseService)
    private db!: IDataBaseService;

    @inject(Types.IAccountModelContainer)
    private accounts!: IAccountModelContainer;

    protected override init(): void
    {
        this.setId("auth");

        super.init();

        this.factory.mapToValue(Types.IAuthContext, this);

        this.factory.mapToValue(Types.ISocketServerService, this.socket);
        this.factory.mapToValue(Types.IDataBaseService, this.db);
        this.factory.mapToValue(Types.IAccountModelContainer, this.accounts);

        this.socket.startListen([
            SocketAction.REGISTER,
            SocketAction.LOGIN,
            SocketAction.GUEST_LOGIN,
            SocketAction.LOGOUT
        ]);

        this.map(DataBaseServiceMessageType.CREATE_COLLECTION_LIST_COMPLETE, MapContextCommandsCommand);

        this.executeCommand(InitUsersTableCommand);
    }

    protected override get defaultUIViewClass(): Class<IInputView>
    {
        return CliInputView;
    }

    public mapCommands(): IAppContext
    {
        registerCommandAlias(RegisterCommand, "register", "register user", [
            {name: "clientId", type: Types.string},
            {name: "dto", requiredValue: {email: Types.string, password: Types.string, nick: Types.string}}
        ]);

        registerCommandAlias(LoginCommand, "login", "login user", [
            {name: "clientId", type: Types.string},
            {name: "email", type: Types.string},
            {name: "password", type: Types.string}
        ]);

        registerCommandAlias(LogoutCommand, "logout", "logout user", [
            {name: "clientId", type: Types.string}
        ]);

        registerCommandAlias([UpdateAccountSnapshotCommand, ResponseCommand],
            "guest_login", "login as guest user", [
                {name: "clientId", type: Types.string},
                {name: "actionName", requiredValue: SocketAction.GUEST_LOGIN.name},
                {name: "success", requiredValue: true},
                {name: "isGuest", requiredValue: true}
            ]);

        this.map(SocketServerServiceMessageType.CLIENT_CONNECTED, AddAccountToMapCommand);
        this.map(SocketServerServiceMessageType.CLIENT_DISCONNECTED, RemoveAccountFromMapCommand);

        this.map<{ action: SocketAction }>(NetServerServiceMessageType.GOT_REQUEST, LoginCommand, {action: SocketAction.LOGIN})
            .addGuards(IsSuitableActionGuards);

        this.map<ResultDto & { action: SocketAction; isGuest: boolean }>(NetServerServiceMessageType.GOT_REQUEST,
            [UpdateAccountSnapshotCommand, ResponseCommand], {
                action: SocketAction.GUEST_LOGIN,
                isGuest: true,
                success: true
            }).addGuards(IsSuitableActionGuards);

        this.map<{ action: SocketAction }>(NetServerServiceMessageType.GOT_REQUEST, RegisterCommand, {action: SocketAction.REGISTER})
            .addGuards(IsSuitableActionGuards);

        this.map<{ action: SocketAction }>(NetServerServiceMessageType.GOT_REQUEST, LogoutCommand, {action: SocketAction.LOGOUT})
            .addGuards(IsSuitableActionGuards);

        this.map<ResultDto & { action: SocketAction; queryId: string }>(DataBaseServiceMessageType.INSERT_SUCCESS, ResponseCommand, {
            queryId: SocketAction.REGISTER.name,
            action: SocketAction.REGISTER,
            success: true
        }).addGuards(IsSuitableQueryGuards);

        this.map<ResultDto & { action: SocketAction; queryId: string }>(DataBaseServiceMessageType.INSERT_FAIL, ResponseCommand, {
            queryId: SocketAction.REGISTER.name,
            action: SocketAction.REGISTER,
            success: false,
            reason: ErrorReason.USER_EXISTS.name
        }).addGuards(IsSuitableQueryGuards);

        this.map<ResultDto & { action: SocketAction; queryId: string }>(DataBaseServiceMessageType.FIND_SUCCESS,
            [UpdateAccountSnapshotCommand, ResponseCommand], {
                queryId: SocketAction.LOGIN.name,
                action: SocketAction.LOGIN,
                success: true
            }).addGuards(IsSuitableQueryGuards).addGuards(IsLoginPasswordMatchesGuards);

        this.map<ResultDto & { action: SocketAction; queryId: string }>(DataBaseServiceMessageType.FIND_SUCCESS, ResponseCommand, {
            queryId: SocketAction.LOGIN.name,
            action: SocketAction.LOGIN,
            success: false,
            reason: ErrorReason.USER_WRONG_PASSWORD.name
        }).addGuards(IsSuitableQueryGuards).addGuardsNot(IsLoginPasswordMatchesGuards);

        this.map<ResultDto & { action: SocketAction; queryId: string }>(DataBaseServiceMessageType.FIND_FAIL, ResponseCommand, {
            queryId: SocketAction.LOGIN.name,
            action: SocketAction.LOGIN,
            success: false,
            reason: ErrorReason.USER_NOT_FOUND.name
        }).addGuards(IsSuitableQueryGuards);

        this.ready();

        return this;
    }
}

setDefaultImplementation<IAuthContext>(Types.IAuthContext, AuthContext);