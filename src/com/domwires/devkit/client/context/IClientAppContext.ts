/* eslint-disable @typescript-eslint/no-empty-interface */

import {AppContext, IAppContext, IAppContextImmutable} from "../../common/context/IAppContext";
import {IInputView} from "../../common/view/IInputView";
import {Class} from "domwires";
import {BrowserConsoleInputView} from "../view/BrowserConsoleInputView";

export interface IClientAppContextImmutable extends IAppContextImmutable
{

}

export interface IClientAppContext extends IClientAppContextImmutable, IAppContext
{

}

export class ClientAppContext extends AppContext implements IClientAppContext
{
    protected override get defaultUIView(): Class<IInputView>
    {
        return BrowserConsoleInputView;
    }
}