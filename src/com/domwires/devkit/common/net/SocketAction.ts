import {Enum} from "domwires";

export class SocketAction extends Enum
{
    public static readonly REGISTER: SocketAction = new SocketAction("REGISTER");
    public static readonly LOGIN: SocketAction = new SocketAction("LOGIN");
    public static readonly GUEST_LOGIN: SocketAction = new SocketAction("GUEST_LOGIN");

    private static readonly MAP: Map<string, SocketAction> = new Map([
        [SocketAction.REGISTER.name, SocketAction.REGISTER],
        [SocketAction.LOGIN.name, SocketAction.LOGIN],
        [SocketAction.GUEST_LOGIN.name, SocketAction.GUEST_LOGIN]
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