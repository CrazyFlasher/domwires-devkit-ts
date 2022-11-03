import {AbstractAuthContextCommand} from "../AbstractAuthContextCommand";
import {lazyInjectNamed} from "domwires";
import {Types} from "../../../../common/Types";
import {AccountDto} from "../../../../common/net/Dto";

export abstract class AbstractAccountCommand extends AbstractAuthContextCommand
{
    @lazyInjectNamed(Types.any, "dto")
    private _dto!: AccountDto;

    @lazyInjectNamed(Types.string, "clientId")
    private _clientId!: string;

    protected dto!: AccountDto | undefined;

    protected clientId!: string;

    public override execute(): void
    {
        super.execute();

        try
        {
            this.dto = this._dto;
        } catch (e)
        {
            const reqData = this.socket.getRequestData<AccountDto>();

            if (reqData)
            {
                this.dto = this.socket.getRequestData<AccountDto>().data;
            }
        }

        try
        {
            this.clientId = this._clientId;
        } catch (e)
        {
            this.clientId = this.socket.requestFromClientId;
        }
    }
}