import "reflect-metadata";
import "./main/context/IClientMainContext";

import {definableFromString} from "domwires";
import {AxiosSioNetClientService} from "./common/service/net/impl/AxiosSioNetClientService";

definableFromString<AxiosSioNetClientService>(AxiosSioNetClientService);