import {AbstractGuards, lazyInjectNamed} from "domwires";
import {CONSTS} from "../../dw_consts";

export class IsCliCommandGuards extends AbstractGuards
{
    @lazyInjectNamed("string", "value")
    private value!: string;

    public override get allows(): boolean
    {
        return this.value.substring(0, 4) === CONSTS.CLI_COMMAND + " ";
    }
}