import {HTML, render, html} from 'ube';
import { inputUpdater } from '../Helpers/inputUpdater'
import { Authentication } from '../Services/Authentication'
import { goTo } from '../Core/Router'

const updateUsername = inputUpdater('username')
const updatePassword = inputUpdater('password')

export class LoginForm extends HTML.Div {

    private username: string
    private password: string
    private hasError = false

    upgradedCallback() {
        this.username = ''
        this.password = ''
        this.draw()
    }

    async onsubmit (event) {
        event.preventDefault()
        const success = await Authentication.login(this.username, this.password)
        if (success) {
            goTo('/editor')
        } else {
            this.hasError = true
            this.draw()
        }
    }

    draw () {
        render(this, html`
            <form class="login-form" onsubmit=${this.onsubmit.bind(this)}>
                <input type="text" .value=${this.username ?? ''} onkeyup=${updateUsername.bind(this)} />
                <input type="password" .value=${this.password ?? ''} onkeyup=${updatePassword.bind(this)} />
                ${this.hasError ? html`<span>Woops something is off...</span>` : null}
                <button>Login</button>
            </form>
        `)
    }
}
 