export type LoginDto = {
    readonly email: string;
    readonly password: string;
};

export type AccountDto = LoginDto & {
    readonly nick: string;
};

export type ResultDto = {
    readonly success: boolean;
    readonly reason?: string;
};