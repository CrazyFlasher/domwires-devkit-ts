import {AbstractModel, IFactoryImmutable, IModel, IModelImmutable} from "domwires";
import {setDefaultImplementation} from "domwires";
import {inject, named, optional} from "inversify";
import {DW_TYPES, FACTORIES_NAMES} from "../../src/com/domwires/devkit/dw_consts";

export interface IMockModel extends IMockModelImmutable, IModel
{
}

export interface IMockModelImmutable extends IModelImmutable
{
    getModelFactory(): IFactoryImmutable;

    getContextFactory(): IFactoryImmutable;

    getMediatorFactory(): IFactoryImmutable;

    getViewFactory(): IFactoryImmutable;
}

export class MockModel extends AbstractModel implements IMockModel
{
    @inject(DW_TYPES.IFactoryImmutable) @named(FACTORIES_NAMES.MODEL)
    private modelFactory: IFactoryImmutable;

    @inject(DW_TYPES.IFactoryImmutable) @named(FACTORIES_NAMES.CONTEXT) @optional()
    private contextFactory: IFactoryImmutable;

    @inject(DW_TYPES.IFactoryImmutable) @named(FACTORIES_NAMES.MEDIATOR) @optional()
    private mediatorFactory: IFactoryImmutable;

    @inject(DW_TYPES.IFactoryImmutable) @named(FACTORIES_NAMES.VIEW) @optional()
    private viewFactory: IFactoryImmutable;

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
}

setDefaultImplementation("IMockModel", MockModel);