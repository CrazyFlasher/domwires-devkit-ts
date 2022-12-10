import {AbstractAuthCommand} from "../AbstractAuthCommand";
import {SocketAction} from "../../../../common/net/SocketAction";
import {lazyInjectNamed} from "domwires";
import {Types} from "../../../../common/Types";
import {ClientServiceRequestType} from "../../../common/service/net/INetClientService";

export class UpdateAccountDataCommand extends AbstractAuthCommand
{
    @lazyInjectNamed(Types.string, "nick")
    private nick!: string;

    public override execute(): void
    {
        super.execute();

        this.account.setSnapshot({
            email: this.account.email!, password: this.account.password, nick: this.nick
        }, true);

        this.netClient.send<{ nick: string }>(SocketAction.UPDATE_ACCOUNT_DATA.name, {
            nick: this.nick
        }, ClientServiceRequestType.TCP);
    }
}