import "reflect-metadata";
import "./main/context/IClientMainContext";

import {definableFromString} from "domwires";
import {AxiosSioNetClientService} from "./common/service/net/impl/AxiosSioNetClientService";
import {LitSignUpMediator} from "./auth/mediator/LitSignUpMediator";
import {decorate, injectable} from "inversify";
import {SignUpView} from "../../../../../example/client/view/SignUpView";

decorate(injectable(), EventTarget);

definableFromString<AxiosSioNetClientService>(AxiosSioNetClientService);
definableFromString<LitSignUpMediator>(LitSignUpMediator);
definableFromString<SignUpView>(SignUpView);