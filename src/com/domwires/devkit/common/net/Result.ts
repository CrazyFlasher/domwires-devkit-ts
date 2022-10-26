import {Enum} from "domwires";

export class Result extends Enum
{
    public static readonly SUCCESS: Result = new Result("SUCCESS");
    public static readonly FAIL: Result = new Result("FAIL");
}