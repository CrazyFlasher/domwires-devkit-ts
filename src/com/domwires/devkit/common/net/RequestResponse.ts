/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: remove default any
export type RequestResponse<TypeType, DataType = any> = {
    readonly id: string;
    readonly type: TypeType;
    readonly data?: DataType;
};