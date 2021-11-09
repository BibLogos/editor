import { html } from 'ube'
import { Route } from '../types'
import { LoginForm } from '../Elements/LoginForm'

export const Login: Route = {
    template: () => html`
        <${LoginForm} />
    `
}