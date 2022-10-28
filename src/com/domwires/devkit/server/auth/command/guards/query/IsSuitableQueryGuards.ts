import {AbstractAuthContextGuards} from "../AbstractAuthContextGuards";
import {lazyInjectNamed} from "domwires";
import {Types} from "../../../../../common/Types";

export class IsSuitableQueryGuards extends AbstractAuthContextGuards
{
    @lazyInjectNamed(Types.string, "queryId")
    private queryId!: string;

    public override get allows(): boolean
    {
        return this.db.query != undefined && this.db.query.id != undefined && this.db.query.id.name === this.queryId;
    }
}