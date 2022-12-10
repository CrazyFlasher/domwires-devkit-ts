import {AbstractAuthCommand} from "../AbstractAuthCommand";
import {SocketAction} from "../../../../common/net/SocketAction";
import {AccountDto} from "../../../../common/net/Dto";
import {lazyInjectNamed} from "domwires";
import {Types} from "../../../../common/Types";
import {ClientServiceRequestType} from "../../../common/service/net/INetClientService";

export class RegisterCommand extends AbstractAuthCommand
{
    @lazyInjectNamed(Types.string, "email")
    private email!: string;

    @lazyInjectNamed(Types.string, "password")
    private password!: string;

    @lazyInjectNamed(Types.string, "nick")
    private nick!: string;

    public override execute(): void
    {
        super.execute();

        this.account.setSnapshot({email: this.email, password: this.password, nick: this.nick}, true);

        this.netClient.send<AccountDto>(SocketAction.REGISTER.name, {
            email: this.email,
            password: this.password,
            nick: this.nick
        }, ClientServiceRequestType.TCP);
    }
}