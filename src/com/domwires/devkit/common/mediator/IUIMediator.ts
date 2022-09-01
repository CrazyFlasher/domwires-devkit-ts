/* eslint-disable @typescript-eslint/no-empty-interface */

import {AbstractMediator, Enum, IFactoryImmutable, IMediator, IMessage} from "domwires";
import {inject, named, postConstruct} from "inversify";
import {IInputView, InputViewMessageType} from "../view/IInputView";
import {DW_TYPES, FACTORIES_NAMES} from "../dw_consts";

export interface IUIMediator extends IMediator
{

}

export class UIMediator extends AbstractMediator
{
    @inject(DW_TYPES.IFactoryImmutable) @named(FACTORIES_NAMES.VIEW)
    protected viewFactory!: IFactoryImmutable;

    private inputView!: IInputView;

    @postConstruct()
    private init(): void
    {
        this.inputView = this.viewFactory.getInstance<IInputView>("IInputView");
        this.inputView.addMessageListener(InputViewMessageType.INPUT, this.handleInput.bind(this));
    }

    private handleInput(m?: IMessage, data?: { value: string }): void
    {
        if (data)
        {
            this.dispatchMessage(UIMediatorMessageType.INPUT, data);
        }
    }
}

export class UIMediatorMessageType extends Enum<string>
{
    public static readonly INPUT: UIMediatorMessageType = new UIMediatorMessageType();
}