import {lazyInjectNamed} from "domwires";
import {Types} from "../../../../common/Types";
import {INetServerService} from "../../../common/service/net/INetServerService";
import {AbstractServerAppContextGuards} from "./AbstractServerAppContextGuards";

export class TargetIsDataBaseServiceGuards extends AbstractServerAppContextGuards
{
    @lazyInjectNamed(Types.INetServerService, "target")
    private target!: INetServerService;

    public override get allows(): boolean
    {
        return this.target === this.db;
    }
}