import {Enum} from "domwires";

export class ErrorReason extends Enum
{
    public static readonly NOT_FOUND: ErrorReason = new ErrorReason("NOT_FOUND");
    public static readonly WRONG_PASSWORD: ErrorReason = new ErrorReason("WRONG_PASSWORD");
    public static readonly EXISTS: ErrorReason = new ErrorReason("EXISTS");
    public static readonly FAILED_TO_FIND_TOKEN: ErrorReason = new ErrorReason("FAILED_TO_FIND_TOKEN");
    public static readonly TOKEN_EXPIRED: ErrorReason = new ErrorReason("TOKEN_EXPIRED");
    public static readonly OLD_PASSWORD_NO_MATCH: ErrorReason = new ErrorReason("OLD_PASSWORD_NO_MATCH");
    public static readonly EMAIL_EXISTS: ErrorReason = new ErrorReason("EMAIL_EXISTS");
    public static readonly UNAUTHORIZED: ErrorReason = new ErrorReason("UNAUTHORIZED");
}