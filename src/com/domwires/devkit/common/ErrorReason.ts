import {Enum} from "domwires";

export class ErrorReason extends Enum
{
    public static readonly USER_NOT_FOUND: ErrorReason = new ErrorReason("USER_NOT_FOUND");
    public static readonly USER_WRONG_PASSWORD: ErrorReason = new ErrorReason("USER_WRONG_PASSWORD");
    public static readonly USER_EXISTS: ErrorReason = new ErrorReason("USER_EXISTS");
}