import {AbstractAsyncCommand} from "domwires/dist/com/domwires/core/mvc/command/AbstractAsyncCommand";
import {inject, optional} from "inversify";
import {Types} from "../../../common/Types";
import {ISocketServerService} from "../../common/service/net/socket/ISocketServerService";
import {IDataBaseService} from "../../common/service/net/db/IDataBaseService";
import {IHttpServerService} from "../../common/service/net/http/IHttpServerService";
import {NetServerServiceMessageType} from "../../common/service/net/INetServerService";

export class CloseServicesCommand extends AbstractAsyncCommand
{
    @inject(Types.IHttpServerService) @optional()
    private http!: IHttpServerService;

    @inject(Types.ISocketServerService) @optional()
    private socket!: ISocketServerService;

    @inject(Types.IDataBaseService) @optional()
    private db!: IDataBaseService;

    public override execute(): void
    {
        super.execute();

        if (this.http && this.http.isOpened)
        {
            this.http.addMessageListener(NetServerServiceMessageType.CLOSE_SUCCESS, () =>
            {
                if (this.socket && this.socket.isOpened)
                {
                    this.socket.addMessageListener(NetServerServiceMessageType.CLOSE_SUCCESS, () =>
                    {
                        if (this.db && this.db.isOpened)
                        {
                            this.db.addMessageListener(NetServerServiceMessageType.CLOSE_SUCCESS, () =>
                            {
                                this.resolve();
                            });

                            this.db.close();
                        } else
                        {
                            this.resolve();
                        }
                    });

                    this.socket.close();
                }
                else
                {
                    this.resolve();
                }
            });

            this.http.close();
        }
        else
        {
            this.resolve();
        }
    }
}