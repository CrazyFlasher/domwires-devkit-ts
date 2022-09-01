import {AbstractGuards, lazyInjectNamed} from "domwires";
import {CONSTS} from "../../dw_consts";

export class IsCliCommandGuards extends AbstractGuards
{
    @lazyInjectNamed("string", "value")
    private value!: string;

    public override get allows(): boolean
    {
        if (this.value.length > 5 && this.value.charAt(5) != " ")
        {
            return this.value.substring(0, 5) === CONSTS.CLI_COMMAND;
        }

        return false;
    }
}