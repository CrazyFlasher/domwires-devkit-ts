import {AbstractLitSignUpView} from "../../../src/com/domwires/devkit/client/auth/view/AbstractLitSignUpView";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import globalStyles from "../styles.css";
import {css} from "lit";
import {customElement} from "lit/decorators.js";

@customElement('sign-up-view')
export class SignUpView extends AbstractLitSignUpView
{
    public static override styles = [
        globalStyles,
        css`
          .panel {
            width: 300px;
          }
        `
    ];
}