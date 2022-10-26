import {AbstractModel, IFactoryImmutable, IModel, IModelImmutable, setDefaultImplementation} from "domwires";
import {inject, named, optional} from "inversify";
import {Types} from "../../src/com/domwires/devkit/common/Types";
import {FactoryNames} from "../../src/com/domwires/devkit/common/FactoryNames";

export interface IMockModel extends IMockModelImmutable, IModel
{
    set v(value: number);
}

export interface IMockModelImmutable extends IModelImmutable
{
    getModelFactory(): IFactoryImmutable;

    getContextFactory(): IFactoryImmutable;

    getMediatorFactory(): IFactoryImmutable;

    getViewFactory(): IFactoryImmutable;

    get v(): number;
}

export class MockModel extends AbstractModel implements IMockModel
{
    @inject(Types.IFactoryImmutable) @named(FactoryNames.MODEL)
    private modelFactory!: IFactoryImmutable;

    @inject(Types.IFactoryImmutable) @named(FactoryNames.CONTEXT) @optional()
    private contextFactory!: IFactoryImmutable;

    @inject(Types.IFactoryImmutable) @named(FactoryNames.MEDIATOR) @optional()
    private mediatorFactory!: IFactoryImmutable;

    @inject(Types.IFactoryImmutable) @named(FactoryNames.VIEW) @optional()
    private viewFactory!: IFactoryImmutable;

    private _v = 0;

    public getModelFactory(): IFactoryImmutable
    {
        return this.modelFactory;
    }

    public getContextFactory(): IFactoryImmutable
    {
        return this.contextFactory;
    }

    public getMediatorFactory(): IFactoryImmutable
    {
        return this.mediatorFactory;
    }

    public getViewFactory(): IFactoryImmutable
    {
        return this.viewFactory;
    }

    public set v(value: number)
    {
        this._v = value;
    }

    public get v(): number
    {
        return this._v;
    }
}

setDefaultImplementation<IMockModel>("IMockModel", MockModel);