/* eslint-disable @typescript-eslint/no-unused-vars */

import {AbstractModel, IModel, IModelImmutable} from "domwires";
import {DwError} from "../DwError";

export interface ISnapshotModelImmutable<SnapshotType> extends IModelImmutable
{
    get snapshot(): SnapshotType;
}

export interface ISnapshotModel<SnapshotType> extends ISnapshotModelImmutable<SnapshotType>, IModel
{
    setSnapshot(value: SnapshotType): ISnapshotModel<SnapshotType>;
}

export abstract class AbstractSnapshotModel<SnapshotType> extends AbstractModel implements ISnapshotModel<SnapshotType>
{
    public get snapshot(): SnapshotType
    {
        throw new Error(DwError.OVERRIDE.name);
    }

    public setSnapshot(value: SnapshotType): ISnapshotModel<SnapshotType>
    {
        throw new Error(DwError.OVERRIDE.name);
    }
}