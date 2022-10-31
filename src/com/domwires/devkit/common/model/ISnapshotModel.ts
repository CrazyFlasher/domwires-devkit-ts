/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {AbstractHierarchyObject, IHierarchyObject, IHierarchyObjectImmutable} from "domwires";

export interface ISnapshotModelImmutable<TSnapshot> extends IHierarchyObjectImmutable
{
    get snapshot(): TSnapshot;
}

export interface ISnapshotModel<TSnapshot> extends ISnapshotModelImmutable<TSnapshot>, IHierarchyObject
{
    setSnapshot(value: TSnapshot): ISnapshotModel<TSnapshot>;
}

export class SnapshotModel<TSnapshot> extends AbstractHierarchyObject implements ISnapshotModel<TSnapshot>
{
    public get snapshot(): TSnapshot
    {
        const result = {};

        for (const propName of Object.keys(this))
        {
            if (this.isSnapshotValue(propName))
            {
                Reflect.set(result, this.removeDash(propName), Reflect.get(this as any, propName));
            }
        }

        return result as TSnapshot;
    }

    public setSnapshot(value: TSnapshot): ISnapshotModel<TSnapshot>
    {
        for (const propName of Object.keys(value))
        {
            if (this.isSnapshotValue("_" + propName))
            {
                Reflect.set(this as any, "_" + propName, Reflect.get(value as any, propName));
            }
        }

        return this;
    }

    private removeDash(propName: string): string
    {
        if (propName.charAt(0) === "_")
        {
            return propName.substring(1, propName.length);
        }

        return propName;
    }

    private isSnapshotValue(propName: string): boolean
    {
        return Reflect.getMetadata("snapshotValue", this, propName) === "snapshotValue";
    }
}