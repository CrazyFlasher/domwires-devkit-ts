import {AbstractHierarchyObject, IFactoryImmutable} from "domwires";
import {ISignUpMediator} from "./ISignUpMediator";
import {inject, named, postConstruct} from "inversify";
import {Types} from "../../../common/Types";
import {FactoryNames} from "../../../common/FactoryNames";
import {AbstractLitSignUpView, ISignUpView} from "../view/AbstractLitSignUpView";

// decorate(injectable(), LitElementView);

export class LitSignUpMediator extends AbstractHierarchyObject implements ISignUpMediator
{
    @inject(Types.IFactoryImmutable) @named(FactoryNames.VIEW)
    protected viewFactory!: IFactoryImmutable;

    @postConstruct()
    private init():void
    {
        const view = this.viewFactory.getInstance<ISignUpView>("ISignUpView");
        // const view = new LitSignUpView();

        document.body.appendChild(view as HTMLElement);
    }
}