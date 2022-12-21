import crypto from "crypto";
import {AccountDto} from "../../common/net/Dto";

export class ServerUtils
{
    private static guestIndex = 0;

    private static get newGuestId(): string
    {
        ServerUtils.guestIndex++;

        return "guest_" + ServerUtils.guestIndex;
    }

    public static get newGuestDto(): AccountDto
    {
        const guestId: string = ServerUtils.newGuestId;

        return {email: guestId, nick: guestId, password: guestId};
    }

    public static hashPassword(value: AccountDto): AccountDto;
    public static hashPassword(value: string): string;
    public static hashPassword(value: string | AccountDto): string | AccountDto
    {
        if (typeof value === "string")
        {
            return crypto.createHmac("sha256", "it_is_very_secret")
                .update(value)
                .digest("hex");
        }

        let password = value.password;

        if (password)
        {
            password = ServerUtils.hashPassword(password);
        }

        return {email: value!.email, password, nick: value!.nick};
    }

    public static getRandomPassword(hashed = true): string
    {
        const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        const pass = Array.from(crypto.randomFillSync(new Uint32Array(8)))
            .map((x) => chars[x as number % chars.length])
            .join('');

        return hashed ? ServerUtils.hashPassword(pass) : pass;
    }
}