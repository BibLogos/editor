import { render, html } from 'ube'
import { goTo, Router } from './Core/Router'
import { Authentication } from './Services/Authentication'

export const renderApp = async () => {
    try {
        const route = await Router.resolve({ pathname: location.pathname })
        if (route.redirect) {
            location.pathname = route.redirect()
        }
        else {
            render(document.body, route.template())
        }
    }
    catch (exception) {
        render(document.body, html`<h3>Exception: ${exception}</h3>`)
    }
}

const previousLogin = localStorage.auth

if (previousLogin) {
    const [username, password] = previousLogin.split(':')
    Authentication.login(username, password)
}

if (!Authentication.isLoggedIn()) goTo('/login')

renderApp()