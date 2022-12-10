import {Enum} from "domwires";

export class Collection extends Enum
{
    public static readonly ACCOUNTS: Collection = new Collection("ACCOUNTS");
    public static readonly TOKENS: Collection = new Collection("TOKENS");
}