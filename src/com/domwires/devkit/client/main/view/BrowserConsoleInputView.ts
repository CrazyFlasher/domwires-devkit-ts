import {postConstruct} from "inversify";
import {AbstractInputView} from "../../../common/app/view/IInputView";

export class BrowserConsoleInputView extends AbstractInputView
{
    @postConstruct()
    private init(): void
    {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        global.cmd = this.execute.bind(this);
    }

    public execute(value: string): void
    {
        this.dispatchInput(value);
    }
}