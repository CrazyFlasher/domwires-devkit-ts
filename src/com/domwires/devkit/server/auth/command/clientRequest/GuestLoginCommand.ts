import {Utils} from "../../../../common/utils/Utils";
import {AbstractClientRequestHandler} from "./AbstractClientRequestHandler";
import {Enum} from "domwires";
import {SocketAction} from "../../../../common/net/SocketAction";

export class GuestLoginCommand extends AbstractClientRequestHandler
{
    protected override async process()
    {
        if (this.account)
        {
            this.account.setIsLoggedIn(true).setIsGuest(true)
                .setSnapshot(Utils.newGuestDto);

            this.socketResponse({success: true, data: this.account.snapshot});

            this.resolve();
        }
    }

    protected override get cliReqAction(): Enum
    {
        return SocketAction.GUEST_LOGIN;
    }
}