import {AbstractCommand, lazyInjectNamed} from "domwires";
import {Types} from "../../../common/Types";
import {INetServerService} from "../../common/service/net/INetServerService";

export class OpenServiceCommand extends AbstractCommand
{
    @lazyInjectNamed(Types.INetServerService,"service")
    private service!: INetServerService;

    public override execute(): void
    {
        super.execute();

        this.service.init();
    }
}