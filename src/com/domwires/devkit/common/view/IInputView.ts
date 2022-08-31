/* eslint-disable @typescript-eslint/no-empty-interface */

import {Enum, IMessageDispatcher, MessageDispatcher} from "domwires";

export interface IInputView extends IMessageDispatcher
{

}

export class InputViewMessageType extends Enum<string>
{
    public static readonly INPUT: InputViewMessageType = new InputViewMessageType();
}

export abstract class NoUIInputView extends MessageDispatcher implements IInputView
{
    protected dispatchInput(value: string): void
    {
        this.dispatchMessage(InputViewMessageType.INPUT, "/cmd:" + value);
    }
}