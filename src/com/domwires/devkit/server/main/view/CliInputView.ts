import {postConstruct} from "inversify";
import {AbstractInputView} from "../../../common/view/IInputView";
import {clearTimeout} from "timers";
import {Interface} from "readline";

export class CliInputView extends AbstractInputView
{
    private cli = require("readline");

    private initTimeout!: NodeJS.Timeout | undefined;

    private readLine!: Interface;

    @postConstruct()
    private init(): void
    {
        this.initTimeout = setTimeout(this.listenCliInput.bind(this), 500);
    }

    public override dispose(): void
    {
        if (this.initTimeout)
        {
            clearTimeout(this.initTimeout);
        }
        if (this.readLine)
        {
            this.readLine.close();
        }

        super.dispose();
    }

    private listenCliInput(): void
    {
        this.initTimeout = undefined;

        this.readLine = this.cli.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        this.listenPrompt();
    }

    private listenPrompt(): void
    {
        this.readLine.question("\x1b[1mEnter command alias to execute or \"/help\":\x1b[0m ", (text: string) =>
        {
            this.dispatchInput(text);

            this.listenPrompt();
        });
    }
}