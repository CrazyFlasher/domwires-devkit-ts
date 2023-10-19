import {IHierarchyObject, MessageType} from "domwires";

export class SignUpMediatorMessageType extends MessageType
{
    public static readonly REGISTER: SignUpMediatorMessageType = new SignUpMediatorMessageType("REGISTER");
    public static readonly LOGIN: SignUpMediatorMessageType = new SignUpMediatorMessageType("LOGIN");
    public static readonly LOGOUT: SignUpMediatorMessageType = new SignUpMediatorMessageType("LOGOUT");
    public static readonly UPDATE_ACCOUNT_DATA: SignUpMediatorMessageType = new SignUpMediatorMessageType("UPDATE_ACCOUNT_DATA");
    public static readonly UPDATE_PASSWORD: SignUpMediatorMessageType = new SignUpMediatorMessageType("UPDATE_PASSWORD");
    public static readonly UPDATE_EMAIL: SignUpMediatorMessageType = new SignUpMediatorMessageType("UPDATE_EMAIL");
    public static readonly RESET_PASSWORD: SignUpMediatorMessageType = new SignUpMediatorMessageType("RESET_PASSWORD");
    public static readonly DELETE_ACCOUNT: SignUpMediatorMessageType = new SignUpMediatorMessageType("DELETE_ACCOUNT");
}

export interface ISignUpMediator extends IHierarchyObject
{

}