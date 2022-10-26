import {AbstractGuards, lazyInjectNamed} from "domwires";

export class IsCliCommandGuards extends AbstractGuards
{
    @lazyInjectNamed("string", "value")
    private value!: string;

    public override get allows(): boolean
    {
        if (this.value.length > 5 && this.value.charAt(5) != " ")
        {
            return this.value.substring(0, 5) === "/cmd:";
        }

        return false;
    }
}