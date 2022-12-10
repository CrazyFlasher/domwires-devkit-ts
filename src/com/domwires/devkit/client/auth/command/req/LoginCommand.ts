import {AbstractAuthCommand} from "../AbstractAuthCommand";
import {SocketAction} from "../../../../common/net/SocketAction";
import {LoginDto} from "../../../../common/net/Dto";
import {lazyInjectNamed} from "domwires";
import {Types} from "../../../../common/Types";
import {ClientServiceRequestType} from "../../../common/service/net/INetClientService";

export class LoginCommand extends AbstractAuthCommand
{
    @lazyInjectNamed(Types.string, "email")
    private email!: string;

    @lazyInjectNamed(Types.string, "password")
    private password!: string;

    public override execute(): void
    {
        super.execute();

        this.netClient.send<LoginDto>(SocketAction.LOGIN.name, {
            email: this.email,
            password: this.password
        }, ClientServiceRequestType.TCP);
    }
}