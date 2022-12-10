import {AbstractAuthCommand} from "../AbstractAuthCommand";
import {SocketAction} from "../../../../common/net/SocketAction";
import {lazyInjectNamed} from "domwires";
import {Types} from "../../../../common/Types";
import {ClientServiceRequestType} from "../../../common/service/net/INetClientService";

export class UpdatePasswordCommand extends AbstractAuthCommand
{
    @lazyInjectNamed(Types.string, "oldPassword")
    private oldPassword!: string;

    @lazyInjectNamed(Types.string, "newPassword")
    private newPassword!: string;

    public override execute(): void
    {
        super.execute();

        // TODO: compare old and new passwords in mediator?

        this.account.setSnapshot({
            email: this.account.email!, password: this.newPassword, nick: this.account.nick!
        }, true);

        this.netClient.send<{ oldPassword: string; newPassword: string }>(SocketAction.UPDATE_PASSWORD.name, {
            oldPassword: this.oldPassword,
            newPassword: this.newPassword
        }, ClientServiceRequestType.TCP);
    }
}