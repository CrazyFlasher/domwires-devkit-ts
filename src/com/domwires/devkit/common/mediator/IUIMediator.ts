/* eslint-disable @typescript-eslint/no-empty-interface */

import {AbstractMediator, Enum, IFactoryImmutable, IMediator, IMessage} from "domwires";
import {inject, named, postConstruct} from "inversify";
import {IInputView, InputViewMessageType} from "../view/IInputView";
import {CONSTS, DW_TYPES, FACTORIES_NAMES} from "../dw_consts";
import {printMappedToAliasCommandsToConsole} from "../Global";

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
        this.inputView = this.viewFactory.getInstance<IInputView>(DW_TYPES.IInputView);
        this.inputView.addMessageListener(InputViewMessageType.INPUT, this.handleInput.bind(this));
    }

    private handleInput(message?: IMessage, data?: { value: string }): void
    {
        if (data)
        {
            if (data.value.replace(/\s/g, '') === CONSTS.CLI_HELP)
            {
                printMappedToAliasCommandsToConsole();
            }
            else
            {
                data.value = CONSTS.CLI_COMMAND + data.value;
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

export class UIMediatorMessageType extends Enum<string>
{
    public static readonly INPUT: UIMediatorMessageType = new UIMediatorMessageType();
}