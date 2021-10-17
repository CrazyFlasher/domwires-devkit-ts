import {AbstractModel, IAppFactoryImmutable, IModel, IModelImmutable} from "../../../domwires-ts";
import {setDefaultImplementation} from "domwires";
import {inject, named, optional} from "inversify";
import {DW_TYPES, FACTORIES_NAMES} from "../../src/com/domwires/devkit/dw_consts";

export interface IMockModel extends IMockModelImmutable, IModel
{
}

export interface IMockModelImmutable extends IModelImmutable
{
    getModelFactory(): IAppFactoryImmutable;

    getContextFactory(): IAppFactoryImmutable;

    getMediatorFactory(): IAppFactoryImmutable;

    getViewFactory(): IAppFactoryImmutable;
}

export class MockModel extends AbstractModel implements IMockModel
{
    @inject(DW_TYPES.IAppFactoryImmutable) @named(FACTORIES_NAMES.MODEL)
    private modelFactory: IAppFactoryImmutable;

    @inject(DW_TYPES.IAppFactoryImmutable) @named(FACTORIES_NAMES.CONTEXT) @optional()
    private contextFactory: IAppFactoryImmutable;

    @inject(DW_TYPES.IAppFactoryImmutable) @named(FACTORIES_NAMES.MEDIATOR) @optional()
    private mediatorFactory: IAppFactoryImmutable;

    @inject(DW_TYPES.IAppFactoryImmutable) @named(FACTORIES_NAMES.VIEW) @optional()
    private viewFactory: IAppFactoryImmutable;

    public getModelFactory(): IAppFactoryImmutable
    {
        return this.modelFactory;
    }

    public getContextFactory(): IAppFactoryImmutable
    {
        return this.contextFactory;
    }

    public getMediatorFactory(): IAppFactoryImmutable
    {
        return this.mediatorFactory;
    }

    public getViewFactory(): IAppFactoryImmutable
    {
        return this.viewFactory;
    }
}

setDefaultImplementation("IMockModel", MockModel);