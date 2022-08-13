/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-empty-function */

import {postConstruct} from "inversify";
import {AbstractModel, IModel, IModelImmutable} from "domwires";

export interface IComponentImmutable extends IModelImmutable
{
}


export interface IComponent extends IModel, IComponentImmutable
{
}


export class AbstractComponent extends AbstractModel implements IModel
{
    @postConstruct()
    protected init(): void
    {
    }
}
