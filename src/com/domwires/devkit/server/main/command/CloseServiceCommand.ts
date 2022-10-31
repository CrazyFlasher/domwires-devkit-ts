import {AbstractAsyncCommand} from "domwires/dist/com/domwires/core/mvc/command/AbstractAsyncCommand";
import {Types} from "../../../common/Types";
import {INetServerService} from "../../common/service/net/INetServerService";
import {lazyInjectNamed} from "domwires";

export class CloseServiceCommand extends AbstractAsyncCommand
{
    @lazyInjectNamed(Types.INetServerService,"service")
    private service!: INetServerService;

    public override execute(): void
    {
        super.execute();

        this.service.close();
    }
}