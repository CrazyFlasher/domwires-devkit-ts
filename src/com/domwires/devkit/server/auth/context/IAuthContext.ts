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
import {IAccountModel} from "../../../common/model/IAccountModel";
import {RegisterCommand} from "../command/account/RegisterCommand";
import {IsRegisterActionGuards} from "../command/guards/socket/IsRegisterActionGuards";
import {IsRegisterQueryGuards} from "../command/guards/query/IsRegisterQueryGuards";
import {LoginCommand} from "../command/account/LoginCommand";
import {IsLoginActionGuards} from "../command/guards/socket/IsLoginActionGuards";
import {IsLoginQueryGuards} from "../command/guards/query/IsLoginQueryGuards";
import {IsLoginPasswordMatchesGuards} from "../command/guards/query/IsLoginPasswordMatchesGuards";
import {LoginResponseCommand} from "../command/response/LoginResponseCommand";
import {RegisterResponseCommand} from "../command/response/RegisterResponseCommand";
import {registerCommandAlias} from "../../../common/Global";
import {IInputView} from "../../../common/view/IInputView";
import {CliInputView} from "../../main/view/CliInputView";
import {ErrorReason} from "../../../common/ErrorReason";
import {ResultDto} from "../../../common/net/dto/Dto";

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

    @inject("Map<string, IAccountModel>")
    private accountModelMap!: Map<string, IAccountModel>;

    protected override init(): void
    {
        this._id = "auth";

        super.init();

        this.factory.mapToValue(Types.IAuthContext, this);

        this.factory.mapToValue(Types.ISocketServerService, this.socket);
        this.factory.mapToValue(Types.IDataBaseService, this.db);
        this.factory.mapToValue("Map<string, IAccountModel>", this.accountModelMap);

        this.socket.startListen([
            SocketAction.REGISTER,
            SocketAction.LOGIN,
            SocketAction.GUEST_LOGIN
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
        registerCommandAlias(RegisterCommand, "register", "register user");
        registerCommandAlias(LoginCommand, "login", "login user");

        this.map(SocketServerServiceMessageType.CLIENT_CONNECTED, AddAccountToMapCommand);
        this.map(SocketServerServiceMessageType.CLIENT_DISCONNECTED, RemoveAccountFromMapCommand);

        this.map(NetServerServiceMessageType.GOT_REQUEST, RegisterCommand).addGuards(IsRegisterActionGuards);
        this.map(NetServerServiceMessageType.GOT_REQUEST, LoginCommand).addGuards(IsLoginActionGuards);

        this.map<ResultDto>(DataBaseServiceMessageType.INSERT_SUCCESS, RegisterResponseCommand, {success: true})
            .addGuards(IsRegisterQueryGuards);

        this.map<ResultDto>(DataBaseServiceMessageType.INSERT_FAIL, RegisterResponseCommand, {
            success: false,
            reason: ErrorReason.USER_EXISTS.name
        }).addGuards(IsRegisterQueryGuards);

        this.map<ResultDto>(DataBaseServiceMessageType.FIND_SUCCESS, LoginResponseCommand, {success: true})
            .addGuards(IsLoginQueryGuards).addGuards(IsLoginPasswordMatchesGuards);

        this.map<ResultDto>(DataBaseServiceMessageType.FIND_SUCCESS, LoginResponseCommand, {
            success: false,
            reason: ErrorReason.USER_WRONG_PASSWORD.name
        }).addGuards(IsLoginQueryGuards).addGuardsNot(IsLoginPasswordMatchesGuards);

        this.map<ResultDto>(DataBaseServiceMessageType.FIND_FAIL, LoginResponseCommand, {
            success: false,
            reason: ErrorReason.USER_NOT_FOUND.name
        }).addGuards(IsLoginQueryGuards);

        this.ready();

        return this;
    }
}

setDefaultImplementation<IAuthContext>(Types.IAuthContext, AuthContext);