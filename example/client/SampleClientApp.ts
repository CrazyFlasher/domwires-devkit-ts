import "../../src/com/domwires/devkit/client/ClientRefs";

import {Factory, Logger, LogLevel} from "domwires";
import {AbstractDevkitApp} from "../../src/com/domwires/devkit/common/app/AbstractDevkitApp";
import {Types} from "../../src/com/domwires/devkit/common/Types";

class SampleClientApp extends AbstractDevkitApp
{
    protected override get mainContextType(): string
    {
        return Types.IClientMainContext;
    }
}

new Factory(new Logger(LogLevel.VERBOSE)).getInstance<SampleClientApp>(SampleClientApp);