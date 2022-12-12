import {AbstractAuthContextGuards} from "./AbstractAuthContextGuards";
import {ILogger, lazyInjectNamed} from "domwires";
import {Types} from "../../../../common/Types";
import {inject} from "inversify";

export class ClientExistsGuards extends AbstractAuthContextGuards
{
    @lazyInjectNamed(Types.string, "clientId")
    private _requestFromClientId!: string | undefined;
    protected requestFromClientId!: string | undefined;

    @inject(Types.ILogger)
    protected logger!: ILogger;

    public override get allows(): boolean
    {
        try
        {
            this.requestFromClientId = this._requestFromClientId;
        } catch (e)
        {
            return false;
        }

        let allows = false;

        if (this.requestFromClientId)
        {
            const account = this.accounts.contains(this.requestFromClientId);

            if (account)
            {
                allows = true;
            }
        }

        this.printLog(allows);

        return allows;
    }

    protected printLog(allows: boolean): void
    {
        if (!allows)
        {
            this.logger.warn("Client not found:", this.requestFromClientId);
            this.logger.warn("If using CLI, call \"create_client\" to directly create new client");
        }
    }
}