/* eslint-disable @typescript-eslint/no-empty-interface */

import {IMessageDispatcher, MessageDispatcher, MessageType} from "domwires";

export interface IInputView extends IMessageDispatcher
{

}

export class InputViewMessageType extends MessageType<string>
{
    public static readonly INPUT: InputViewMessageType = new InputViewMessageType();
}

export abstract class AbstractInputView extends MessageDispatcher implements IInputView
{
    protected dispatchInput(value: string): void
    {
        this.dispatchMessage(InputViewMessageType.INPUT, {value: value});
    }
}