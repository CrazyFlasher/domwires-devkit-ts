/* eslint-disable @typescript-eslint/no-empty-interface */

import {Enum, IMessageDispatcher, MessageDispatcher} from "domwires";
import {postConstruct} from "inversify";

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
        this.info("Executing command: " + value);
        this.dispatchMessage(InputViewMessageType.INPUT, "cmd " + value);
    }
}

export class CLIInputView extends NoUIInputView
{
    private cli = require("inquirer");

    @postConstruct()
    private init(): void
    {
        this.listenCliInput();
    }

    private listenCliInput(): void
    {
        this.cli.prompt([
            {
                type: "input",
                name: "cmd",
                message: "Enter command alias to execute: "
            }
        ]).then((value: string) =>
        {
            this.dispatchInput(value);

            this.listenCliInput();
        });
    }
}

export class BrowserConsoleInputView extends NoUIInputView
{
    public cmd(value: string): void
    {
        this.dispatchInput(value);
    }
}