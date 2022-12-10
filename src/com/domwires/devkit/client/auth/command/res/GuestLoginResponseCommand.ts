import {LoginResponseCommand} from "./LoginResponseCommand";

export class GuestLoginResponseCommand extends LoginResponseCommand
{
    protected override get isGuest(): boolean
    {
        return true;
    }
}