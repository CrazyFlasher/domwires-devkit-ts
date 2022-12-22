import "reflect-metadata";
import "./main/context/IClientMainContext";

import {definableFromString} from "domwires";
import {AxiosSioNetClientService} from "./common/service/net/impl/AxiosSioNetClientService";
import {LitSignUpMediator} from "./auth/mediator/LitSignUpMediator";
import {LitSignUpView} from "./auth/view/LitSignUpView";
import {decorate, injectable} from "inversify";

decorate(injectable(), EventTarget);

definableFromString<AxiosSioNetClientService>(AxiosSioNetClientService);
definableFromString<LitSignUpMediator>(LitSignUpMediator);
definableFromString<LitSignUpView>(LitSignUpView);