import {AbstractGuards, lazyInjectNamed} from "domwires";
import {Types} from "../../../../common/Types";
import {INetServerService} from "../../../common/service/net/INetServerService";

export class IsOpenedServiceGuards extends AbstractGuards
{
    @lazyInjectNamed(Types.INetServerService,"service")
    private service!: INetServerService;

    public override get allows(): boolean
    {
        return this.service.isOpened;
    }
}