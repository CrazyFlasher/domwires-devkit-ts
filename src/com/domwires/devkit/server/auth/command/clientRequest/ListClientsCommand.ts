import {AbstractAuthContextCommand} from "../common/AbstractAuthContextCommand";

export class ListClientsCommand extends AbstractAuthContextCommand
{
    public override execute(): void
    {
        super.execute();

        this.accounts.childrenMap.forEach(value => {
            this.logger.info("\nID:", value.id, "\nSnapshot:", value.snapshot, "\nLogged in:", value.isLoggedIn,
                "\nIs guest:", value.isGuest, "\n--------------------");
        });
        this.logger.info("Total:", this.accounts.childrenMap.size);
    }
}