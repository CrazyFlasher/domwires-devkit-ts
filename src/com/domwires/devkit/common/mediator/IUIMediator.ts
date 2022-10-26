/* eslint-disable @typescript-eslint/no-empty-interface */

import {AbstractMediator, IFactoryImmutable, IMediator, IMessage, MessageType} from "domwires";
import {inject, named, postConstruct} from "inversify";
import {IInputView, InputViewMessageType} from "../view/IInputView";
import {printMappedToAliasCommandsToConsole} from "../Global";
import {Types} from "../Types";
import {FactoryNames} from "../FactoryNames";

export interface IUIMediator extends IMediator
{

}

export class UIMediator extends AbstractMediator
{
    @inject(Types.IFactoryImmutable) @named(FactoryNames.VIEW)
    protected viewFactory!: IFactoryImmutable;

    private inputView!: IInputView;

    @postConstruct()
    private init(): void
    {
        this.inputView = this.viewFactory.getInstance<IInputView>(Types.IInputView);
        this.inputView.addMessageListener(InputViewMessageType.INPUT, this.handleInput.bind(this));
    }

    private handleInput(message?: IMessage, data?: { value: string }): void
    {
        if (data)
        {
            if (data.value.replace(/\s/g, '') === "/help")
            {
                printMappedToAliasCommandsToConsole();
            }
            else
            {
                data.value = "/cmd:" + data.value;
                this.dispatchMessage(UIMediatorMessageType.INPUT, data);
            }
        }
    }

    public override dispose(): void
    {
        this.inputView.dispose();

        super.dispose();
    }
}

export class UIMediatorMessageType extends MessageType<string>
{
    public static readonly INPUT: UIMediatorMessageType = new UIMediatorMessageType();
}