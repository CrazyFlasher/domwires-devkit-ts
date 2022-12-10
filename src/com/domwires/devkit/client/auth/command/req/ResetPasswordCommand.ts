import {AbstractAuthCommand} from "../AbstractAuthCommand";
import {SocketAction} from "../../../../common/net/SocketAction";
import {LoginDto} from "../../../../common/net/Dto";
import {lazyInjectNamed} from "domwires";
import {Types} from "../../../../common/Types";
import {ClientServiceRequestType} from "../../../common/service/net/INetClientService";

export class ResetPasswordCommand extends AbstractAuthCommand
{
    @lazyInjectNamed(Types.string, "email")
    private email!: string;

    public override execute(): void
    {
        super.execute();

        this.netClient.send<LoginDto>(SocketAction.RESET_PASSWORD.name, {
            email: this.email
        }, ClientServiceRequestType.TCP);
    }
}