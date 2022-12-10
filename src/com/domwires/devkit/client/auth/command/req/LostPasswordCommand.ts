import {AbstractAuthCommand} from "../AbstractAuthCommand";
import {SocketAction} from "../../../../common/net/SocketAction";
import {lazyInjectNamed} from "domwires";
import {Types} from "../../../../common/Types";
import {ClientServiceRequestType} from "../../../common/service/net/INetClientService";

export class LostPasswordCommand extends AbstractAuthCommand
{
    @lazyInjectNamed(Types.string, "email")
    private email!: string;

    public override execute(): void
    {
        super.execute();

        this.netClient.send<{ email: string }>(SocketAction.RESET_PASSWORD.name, {
            email: this.email
        }, ClientServiceRequestType.TCP);
    }
}