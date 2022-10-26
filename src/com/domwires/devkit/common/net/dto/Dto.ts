export type LoginDto = {
    readonly email: string;
    readonly password: string;
};

export type RegisterDto = LoginDto & {
    readonly nick: string;
};

export type ResultDto = {
    readonly result: string;
    readonly reason?: string;
};