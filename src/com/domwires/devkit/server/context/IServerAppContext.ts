/* eslint-disable @typescript-eslint/no-empty-interface */

import {AppContext, IAppContext, IAppContextImmutable} from "../../common/context/IAppContext";
import {IInputView} from "../../common/view/IInputView";
import {Class} from "domwires";
import {CliInputView} from "../view/CliInputView";

export interface IServerAppContextImmutable extends IAppContextImmutable
{

}

export interface IServerAppContext extends IServerAppContextImmutable, IAppContext
{

}

export class ServerAppContext extends AppContext implements IServerAppContext
{
    protected override get defaultUIView(): Class<IInputView>
    {
        return CliInputView;
    }
}