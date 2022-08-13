import {GameObject} from "./GameObject";

/* @Suffix = Component */
/* @Model */
export type Building = GameObject & {
    readonly maxUnits: number;
    readonly creationTime: number;
};