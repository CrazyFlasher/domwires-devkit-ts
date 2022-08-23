export type Position = {
    x: number;
    y: number;
};

export type Dimensions = {
    width: number;
    height: number;
};

export type Entity = {
    id: string;
    name: string;
};

export type CountEntity = {
    entity: Entity;
    count: number;
};

export type Craft = {
    in: { list: Array<CountEntity>; work: number };
    out: Array<CountEntity>;
};