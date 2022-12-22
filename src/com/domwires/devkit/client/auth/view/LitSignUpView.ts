import {css, html, LitElement} from "lit";
import {customElement, property} from 'lit/decorators.js';
// import style from '../../../../../../../example/client/bootstrap.min.css';

@customElement('sign-up-view')
export class LitSignUpView extends LitElement
{
    public constructor()
    {
        super();
    }

    // public static override styles = style;

    // Declare reactive properties
    @property()
    private name?: string = 'World';

    // Render the UI as a function of component state

    protected override render(): unknown
    {
        return html`
            <nav>
                <h2>Navigation</h2>
                <p>
                    You are on my home page. To the north lies <a href="/blog">my blog</a>, from
                    whence the sounds of battle can be heard. To the east you can see a large
                    mountain, upon which many <a href="/school">school papers</a> are littered.
                    Far up thus mountain you can spy a little figure who appears to be me,
                    desperately scribbling a <a href="/school/thesis">thesis</a>.
                </p>
                <p>
                    To the west are several exits. One fun-looking exit is labeled
                    <a href="https://games.example.com/">"games"</a>. Another more
                    boring-looking exit is labeled <a href="https://isp.example.net/">ISP™</a>.
                </p>
                <p>
                    To the south lies a dark and dank <a href="/about">contacts page</a>.
                    Cobwebs cover its disused entrance, and at one point you see a rat run
                    quickly out of the page.
                </p>
            </nav>`;
    }
}