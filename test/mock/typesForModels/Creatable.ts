import {CountEntity, Entity} from "./Types";

/* @Model */
export type Creatable = {
    readonly in: Array<CountEntity>;
    readonly ent: Entity;
    readonly work: number;
    readonly minLevel: number;
};