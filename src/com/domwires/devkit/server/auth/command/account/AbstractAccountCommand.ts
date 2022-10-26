import {AbstractAuthContextCommand} from "../AbstractAuthContextCommand";
import {lazyInjectNamed} from "domwires";
import {Types} from "../../../../common/Types";
import {LoginDto} from "../../../../common/net/dto/Dto";

export abstract class AbstractAccountCommand extends AbstractAuthContextCommand
{
    @lazyInjectNamed(Types.any, "dto")
    private _dto!: LoginDto;

    @lazyInjectNamed(Types.string, "clientId")
    private _clientId!: string;

    protected dto!: LoginDto | undefined;
    protected clientId!: string;

    public override execute(): void
    {
        super.execute();

        try
        {
            this.dto = this._dto;
            this.clientId = this._clientId;
        } catch (e)
        {
            this.dto = this.socket.getRequestData<LoginDto>().data;
            this.clientId = this.socket.requestFromClientId;
        }
    }
}