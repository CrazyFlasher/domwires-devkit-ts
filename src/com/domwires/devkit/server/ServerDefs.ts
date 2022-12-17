import {definableFromString} from "domwires";
import {SioSocketServerService} from "./common/service/net/socket/impl/SioSocketServerService";

definableFromString<SioSocketServerService>(SioSocketServerService);