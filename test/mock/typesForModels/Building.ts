import {GameObject} from "./GameObject";

/* @Model */
export type Building = GameObject & {
    readonly maxUnits: number;
    readonly creationTime: number;
};