import {ObjectId} from "bson";
import {ErrorReason} from "../ErrorReason";

export type LoginDto = {
    readonly _id?: ObjectId;
    readonly email: string;
    readonly password?: string;
};

export type AccountDto = LoginDto & {
    readonly nick: string;
};

export type ResultDto = {
    readonly success: boolean;
    readonly reason?: string | ErrorReason;
};

export type TokenDto = {
    readonly _id?: ObjectId;
    readonly email?: string;
    readonly type: string;
    readonly expireDt: number;
    readonly userId: ObjectId;
};