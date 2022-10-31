/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-empty-function */

import {postConstruct} from "inversify";
import {AbstractHierarchyObject, IHierarchyObject, IHierarchyObjectImmutable} from "domwires";

export interface IComponentImmutable extends IHierarchyObjectImmutable
{
}


export interface IComponent extends IHierarchyObject, IComponentImmutable
{
}

export abstract class AbstractComponent extends AbstractHierarchyObject implements IHierarchyObject
{
    @postConstruct()
    protected init(): void
    {
    }
}
