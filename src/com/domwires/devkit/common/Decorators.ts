export const SNAPSHOT_VALUE = "snapshotValue";

export function snapshotValue()
{
    return Reflect.metadata(SNAPSHOT_VALUE, SNAPSHOT_VALUE);
}