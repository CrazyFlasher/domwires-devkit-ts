import "../../src/com/domwires/devkit/server/ServerRefs";
import {Factory, Logger, LogLevel} from "domwires";
import {AbstractDevkitApp} from "../../src/com/domwires/devkit/common/app/AbstractDevkitApp";
import {Types} from "../../src/com/domwires/devkit/common/Types";

class SampleServerApp extends AbstractDevkitApp
{
    protected override get mainContextType(): string
    {
        return Types.IServerMainContext;
    }
}

new Factory(new Logger(LogLevel.VERBOSE)).getInstance<SampleServerApp>(SampleServerApp);

