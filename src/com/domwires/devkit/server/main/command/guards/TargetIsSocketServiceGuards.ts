import {lazyInjectNamed} from "domwires";
import {Types} from "../../../../common/Types";
import {INetServerService} from "../../../common/service/net/INetServerService";
import {AbstractServerAppContextGuards} from "./AbstractServerAppContextGuards";

export class TargetIsSocketServiceGuards extends AbstractServerAppContextGuards
{
    @lazyInjectNamed(Types.INetServerService, "target")
    private target!: INetServerService;

    public override get allows(): boolean
    {
        return this.target === this.socket;
    }
}