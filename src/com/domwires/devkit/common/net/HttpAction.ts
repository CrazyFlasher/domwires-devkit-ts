import {Enum} from "domwires";

export class HttpAction extends Enum
{
    public static readonly CONFIRM_RESET_PASSWORD: HttpAction = new HttpAction("password-reset");
    public static readonly CONFIRM_UPDATE_EMAIL: HttpAction = new HttpAction("update-email");
    public static readonly CONFIRM_DELETE_ACCOUNT: HttpAction = new HttpAction("delete-account");

    private static readonly MAP: Map<string, HttpAction> = new Map([
        [HttpAction.CONFIRM_RESET_PASSWORD.name, HttpAction.CONFIRM_RESET_PASSWORD],
        [HttpAction.CONFIRM_UPDATE_EMAIL.name, HttpAction.CONFIRM_UPDATE_EMAIL],
        [HttpAction.CONFIRM_DELETE_ACCOUNT.name, HttpAction.CONFIRM_DELETE_ACCOUNT]
    ]);

    public static get(id: string): HttpAction | undefined
    {
        if (HttpAction.MAP.has(id))
        {
            return HttpAction.MAP.get(id);
        }

        return undefined;
    }
}