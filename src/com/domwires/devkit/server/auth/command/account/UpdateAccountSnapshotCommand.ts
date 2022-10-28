import {AccountDto} from "../../../../common/net/dto/Dto";
import {lazyInjectNamed} from "domwires";
import {Types} from "../../../../common/Types";
import {AbstractAccountCommand} from "./AbstractAccountCommand";

export class UpdateAccountSnapshotCommand extends AbstractAccountCommand
{
    private static guestIndex = 0;

    private static get newGuestId(): string
    {
        UpdateAccountSnapshotCommand.guestIndex++;

        return "guest_" + UpdateAccountSnapshotCommand.guestIndex;
    }

    @lazyInjectNamed(Types.boolean, "isGuest")
    private isGuest!: boolean;

    public override execute(): void
    {
        super.execute();

        let isGuest: boolean;

        try
        {
            isGuest = this.isGuest;
        } catch (e)
        {
            isGuest = false;
        }

        const account = this.accountModelMap.get(!isGuest ? this.queryRelatedToClientId : this.clientId);

        if (account)
        {
            account.setIsLoggedIn(true).setIsGuest(isGuest)
                .setSnapshot(!isGuest ? this.db.getFindResult<AccountDto[]>()[0] : this.newGuestDto);
        }
    }

    private get newGuestDto(): AccountDto
    {
        const guestId: string = UpdateAccountSnapshotCommand.newGuestId;

        return {email: guestId, nick: guestId, password: guestId};
    }
}