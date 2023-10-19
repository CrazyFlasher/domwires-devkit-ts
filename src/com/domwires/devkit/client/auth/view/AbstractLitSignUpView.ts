import {html, LitElement} from "lit";
import {property} from 'lit/decorators.js';

export interface ISignUpView
{
}

export class AbstractLitSignUpView extends LitElement implements ISignUpView
{
    @property()
    private readonly MAX_INPUT_CHARS: number = 50;

    @property()
    private name?: string = 'World';

    protected override render(): unknown
    {
        return html`
            <div>
                <div class="panel">
                    <!--                    <form>-->
                    <div><span class="panel_header">Sign up</span></div>
                    <div class="form_element"><label>E-mail:</label><input name="email" type="email" autocomplete="email" maxlength="${this.MAX_INPUT_CHARS}"/></div>
                    <div class="form_element"><label>Password:</label><input type="password" maxlength="${this.MAX_INPUT_CHARS}"/></div>
                    <div class="form_element"><label>Repeat password:</label><input type="password" maxlength="${this.MAX_INPUT_CHARS}"/></div>
                    <div class="form_element"><label>Nickname:</label><input id="nickname" name="nickname" type="text" maxlength="${this.MAX_INPUT_CHARS}"/></div>
                    <div class="form_element"><label>Birthdate:</label><input type="date"/></div>
                    <div class="form_element">
                        <button>Sign up</button>
                    </div>
                    <!--                    </form>-->
                </div>
            </div>
        `;
    }
}