import {AppContext, IAppContext, IAppContextImmutable} from "../../common/app/context/IAppContext";
import {Types} from "../../common/Types";
import {inject} from "inversify";
import {IAccountModelContainer} from "../../common/main/model/IAccountModelContainer";
import {INetClientService} from "../common/service/net/INetClientService";
import {setDefaultImplementation} from "domwires";

export interface IClientAuthContextImmutable extends IAppContextImmutable
{

}

export interface IClientAuthContext extends IClientAuthContextImmutable, IAppContext
{

}

export class ClientAuthContext extends AppContext implements IAppContext
{
    @inject(Types.INetClientService)
    private netClient!: INetClientService;

    @inject(Types.IAccountModelContainer)
    private accounts!: IAccountModelContainer;

    protected override init(): void
    {
        this.setId("auth");

        super.init();

        this.factory.mapToValue(Types.IClientAuthContext, this);

        this.factory.mapToValue(Types.INetClientService, this.netClient);

        setTimeout(this.ready.bind(this), 100);
    }
}

setDefaultImplementation<IClientAuthContext>(Types.IClientAuthContext, ClientAuthContext);