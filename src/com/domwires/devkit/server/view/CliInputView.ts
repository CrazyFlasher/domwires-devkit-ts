import {postConstruct} from "inversify";
import {NoUIInputView} from "../../common/view/IInputView";

export class CliInputView extends NoUIInputView
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