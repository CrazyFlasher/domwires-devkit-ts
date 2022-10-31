import {lazyInjectNamed} from "domwires";
import {Types} from "../../../../common/Types";
import {AbstractServerAppContextGuards} from "./AbstractServerAppContextGuards";
import {inject} from "inversify";
import {IAppContext} from "../../../../common/context/IAppContext";
import {IAuthContext} from "../../../auth/context/IAuthContext";

export class TargetIsAuthContextGuards extends AbstractServerAppContextGuards
{
    @inject(Types.IAuthContext)
    protected authContext!: IAuthContext;

    @lazyInjectNamed(Types.IAppContext, "target")
    private target!: IAppContext;

    public override get allows(): boolean
    {
        return this.target === this.authContext;
    }
}