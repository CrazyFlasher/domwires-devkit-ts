import "reflect-metadata";
import "./main/context/IServerMainContext";

import {definableFromString} from "domwires";
import {SioSocketServerService} from "./common/service/net/socket/impl/SioSocketServerService";
import {ExpressHttpServerService} from "./common/service/net/http/impl/ExpressHttpServerService";
import {AuthMongoDataBaseService} from "./common/service/net/db/impl/AuthMongoDataBaseService";
import {NodemailerEmailService} from "./common/service/net/email/impl/NodemailerEmailService";

definableFromString<ExpressHttpServerService>(ExpressHttpServerService);
definableFromString<SioSocketServerService>(SioSocketServerService);
definableFromString<AuthMongoDataBaseService>(AuthMongoDataBaseService);
definableFromString<NodemailerEmailService>(NodemailerEmailService);