import {AbstractHierarchyObject, IHierarchyObject, IHierarchyObjectImmutable} from "domwires";
import {SNAPSHOT_VALUE} from "../../Decorators";

export interface ISnapshotModelImmutable<TSnapshot> extends IHierarchyObjectImmutable
{
    get snapshot(): TSnapshot;
}

export interface ISnapshotModel<TSnapshot> extends ISnapshotModelImmutable<TSnapshot>, IHierarchyObject
{
    setSnapshot(value: TSnapshot): ISnapshotModel<TSnapshot>;
}

export class SnapshotModel<TSnapshot extends Record<string, unknown>> extends AbstractHierarchyObject implements ISnapshotModel<TSnapshot>
{
    public get snapshot(): TSnapshot
    {
        const result: Record<string, unknown> = {};

        for (const propName of Object.keys(this))
        {
            if (this.isSnapshotValue(propName))
            {
                Reflect.set(result, this.removeDash(propName), Reflect.get(this, propName));
            }
        }

        /* eslint-disable-next-line no-type-assertion/no-type-assertion */
        return result as TSnapshot;
    }

    public setSnapshot(value: TSnapshot): ISnapshotModel<TSnapshot>
    {
        for (const propName of Object.keys(value))
        {
            if (this.isSnapshotValue("_" + propName))
            {
                Reflect.set(this, "_" + propName, Reflect.get(value, propName));
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
        return Reflect.getMetadata(SNAPSHOT_VALUE, this, propName) !== undefined;
    }
}