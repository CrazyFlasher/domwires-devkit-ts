import {AbstractHierarchyObject, IHierarchyObject, IHierarchyObjectImmutable, MessageType} from "domwires";
import {SNAPSHOT_VALUE} from "../../Decorators";

export class SnapshotModelMessageType extends MessageType
{
    public static readonly SNAPSHOT_VALUES_UPDATED: SnapshotModelMessageType = new SnapshotModelMessageType();
}

export interface ISnapshotModelImmutable<TSnapshot> extends IHierarchyObjectImmutable
{
    get snapshot(): TSnapshot;
}

export interface ISnapshotModel<TSnapshot> extends ISnapshotModelImmutable<TSnapshot>, IHierarchyObject
{
    setSnapshot(value: TSnapshot, preset?: boolean): ISnapshotModel<TSnapshot>;

    confirmPresetSnapshot(): ISnapshotModel<TSnapshot>;

    clearSnapshotValues(): ISnapshotModel<TSnapshot>;
}

export class SnapshotModel<TSnapshot extends Record<string, unknown>> extends AbstractHierarchyObject implements ISnapshotModel<TSnapshot>
{
    private presetSnapshot!: TSnapshot | undefined;

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

    public setSnapshot(value: TSnapshot, preset?: boolean): ISnapshotModel<TSnapshot>
    {
        this.presetSnapshot = value;

        if (!preset)
        {
            this.confirmPresetSnapshot();
        }

        return this;
    }

    public clearSnapshotValues(): ISnapshotModel<TSnapshot>
    {
        for (const propName of Object.keys(this))
        {
            if (this.isSnapshotValue(propName))
            {
                Reflect.set(this, propName, undefined);
            }
        }

        this.presetSnapshot = undefined;

        this.dispatchMessage(SnapshotModelMessageType.SNAPSHOT_VALUES_UPDATED);

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

    public confirmPresetSnapshot(): ISnapshotModel<TSnapshot>
    {
        if (this.presetSnapshot)
        {
            for (const propName of Object.keys(this.presetSnapshot))
            {
                if (this.isSnapshotValue("_" + propName))
                {
                    Reflect.set(this, "_" + propName, Reflect.get(this.presetSnapshot, propName));
                }
            }

            this.presetSnapshot = undefined;

            this.dispatchMessage(SnapshotModelMessageType.SNAPSHOT_VALUES_UPDATED);
        }

        return this;
    }
}