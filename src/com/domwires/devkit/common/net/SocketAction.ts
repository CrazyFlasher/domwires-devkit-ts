import {Enum} from "domwires";

export class SocketAction extends Enum
{
    public static readonly REGISTER: SocketAction = new SocketAction("REGISTER");
    public static readonly LOGIN: SocketAction = new SocketAction("LOGIN");
    public static readonly GUEST_LOGIN: SocketAction = new SocketAction("GUEST_LOGIN");
    public static readonly LOGOUT: SocketAction = new SocketAction("LOGOUT");
    public static readonly RESET_PASSWORD: SocketAction = new SocketAction("RESET_PASSWORD");
    public static readonly UPDATE_PASSWORD: SocketAction = new SocketAction("UPDATE_PASSWORD");
    public static readonly UPDATE_ACCOUNT_DATA: SocketAction = new SocketAction("UPDATE_ACCOUNT_DATA");
    public static readonly UPDATE_EMAIL: SocketAction = new SocketAction("UPDATE_EMAIL");
    public static readonly DELETE_ACCOUNT: SocketAction = new SocketAction("DELETE_ACCOUNT");

    private static readonly MAP: Map<string, SocketAction> = new Map([
        [SocketAction.REGISTER.name, SocketAction.REGISTER],
        [SocketAction.LOGIN.name, SocketAction.LOGIN],
        [SocketAction.GUEST_LOGIN.name, SocketAction.GUEST_LOGIN],
        [SocketAction.LOGOUT.name, SocketAction.LOGOUT],
        [SocketAction.RESET_PASSWORD.name, SocketAction.RESET_PASSWORD],
        [SocketAction.UPDATE_PASSWORD.name, SocketAction.UPDATE_PASSWORD],
        [SocketAction.UPDATE_ACCOUNT_DATA.name, SocketAction.UPDATE_ACCOUNT_DATA],
        [SocketAction.UPDATE_EMAIL.name, SocketAction.UPDATE_EMAIL],
        [SocketAction.DELETE_ACCOUNT.name, SocketAction.DELETE_ACCOUNT]
    ]);

    public static get(id: string): SocketAction | undefined
    {
        if (SocketAction.MAP.has(id))
        {
            return SocketAction.MAP.get(id);
        }

        return undefined;
    }
}