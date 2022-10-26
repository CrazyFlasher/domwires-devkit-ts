import {LoginDto} from "../../../../../common/net/dto/Dto";
import {AbstractAuthContextGuards} from "../AbstractAuthContextGuards";

export class IsLoginPasswordMatchesGuards extends AbstractAuthContextGuards
{
    public override get allows(): boolean
    {
        const accountPassword = this.getAccount(this.queryClientId)?.password;
        const queryPassword = this.db.getFindResult<LoginDto[]>()[0].password;

        return accountPassword === queryPassword;
    }
}