import {Enum} from "domwires";

export class DwError extends Enum
{
    public static readonly OVERRIDE:DwError = new DwError("Override!");
    public static readonly NOT_IMPLEMENTED:DwError = new DwError("Not implemented!");
}