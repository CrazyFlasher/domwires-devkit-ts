import {AbstractAuthContextCommand} from "../common/AbstractAuthContextCommand";
import {IAccountModel} from "../../../../common/main/model/IAccountModel";
import {Enum, lazyInjectNamed} from "domwires";
import {SocketAction} from "../../../../common/net/SocketAction";
import {HttpAction} from "../../../../common/net/HttpAction";
import {Types} from "../../../../common/Types";
import {DwError} from "../../../../common/DwError";

export abstract class AbstractClientRequestHandler<TReqData = void> extends AbstractAuthContextCommand
{
    @lazyInjectNamed(Types.string, "action")
    private _reqAction!: string;
    protected reqAction!: Enum | undefined;

    @lazyInjectNamed(Types.string, "clientId")
    private _requestFromClientId!: string | undefined;
    protected requestFromClientId!: string | undefined;

    @lazyInjectNamed(Types.function, "requestQueryParams")
    protected requestQueryParams!: (id: string) => string | undefined;

    @lazyInjectNamed(Types.any, "data")
    protected reqData!: TReqData | undefined;

    protected account: IAccountModel | undefined;

    public override async execute()
    {
        super.execute();

        try
        {
            try
            {
                this.requestFromClientId = this._requestFromClientId;
            } catch (e)
            {
                // requestFromClientId doesn't exist in event. Probably http request.
            }

            try
            {
                this._reqAction;
            } catch (e)
            {
                // cli

                this._reqAction = this.cliReqAction.name;
            }

            this.reqAction = this.requestFromClientId ? SocketAction.get(this._reqAction) :
                HttpAction.get(this._reqAction);

            this.account = this.accounts.get(this.requestFromClientId!);

            await this.process();
        } catch (e)
        {
            this.logger.error(e);
        }

        this.resolve();
    }

    protected socketResponse<TData>(response: { success?: boolean; data?: TData; reason?: Enum; clientId?: string; action?: Enum }): void
    {
        const clientId = response.clientId ? response.clientId : this.requestFromClientId!;
        const action = response.action ? response.action : this.reqAction!;
        const reason: string | undefined = response.reason ? response.reason.name : undefined;

        this.socket.sendResponse(clientId, {
            action: action.name,
            data: {
                result: {success: response.success, reason},
                data: response.data
            }
        });
    }

    protected httpResponse<TData>(response: { success?: boolean; data?: TData; reason?: Enum; action?: Enum }): void
    {
        const action = response.action ? response.action : this.reqAction!;
        const reason: string | undefined = response.reason ? response.reason.name : undefined;

        this.http.sendResponse({
            action: action.name,
            data: {
                result: {success: response.success, reason},
                data: response.data
            }
        });
    }

    /* eslint-disable-next-line @typescript-eslint/no-empty-function */
    protected async process() {}

    protected get cliReqAction(): Enum
    {
        throw new Error(DwError.OVERRIDE.name);
    }
}