import {AppContext, IAppContext, IAppContextImmutable} from "../../app/context/IAppContext";
import {IFactory} from "domwires";
import {IAccountModelContainer} from "../model/IAccountModelContainer";
import {Types} from "../../Types";
import {DwError} from "../../DwError";

export interface IMainContextImmutable extends IAppContextImmutable
{

}

export interface IMainContext extends IMainContextImmutable, IAppContext
{
    createChildContexts(): IMainContext;

    shutDownComplete(): IMainContext;

    initializationComplete(): IMainContext;
}

export abstract class AbstractMainContext extends AppContext implements IMainContext
{
    protected modelFactory!: IFactory;
    protected serviceFactory!: IFactory;

    private accounts!: IAccountModelContainer;

    protected override init(): void
    {
        super.init();

        this.factory.mapToValue(Types.IAppContext, this);

        this.accounts = this.getModelInstance(Types.IAccountModelContainer);
    }

    protected override createFactories(): {
        contextFactory: IFactory; modelFactory: IFactory; serviceFactory: IFactory;
        mediatorFactory: IFactory; viewFactory: IFactory;
    }
    {
        const result = super.createFactories();

        this.modelFactory = result.modelFactory;
        this.serviceFactory = result.serviceFactory;

        return result;
    }

    public initializationComplete(): IMainContext
    {
        this.ready();

        return this;
    }

    public shutDownComplete(): IMainContext
    {
        this.disposeComplete();

        return this;
    }

    public createChildContexts(): IMainContext
    {
        throw new Error(DwError.NOT_IMPLEMENTED.name);
    }
}