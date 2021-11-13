import { render, html } from 'ube'
import { goTo, Router } from './Core/Router'
import { Authentication } from './Services/Authentication'

let previousRoute = null
export const renderApp = async () => {
    try {
        const route = await Router.resolve({ pathname: location.pathname })
        if (route.redirect) {
            location.pathname = route.redirect()
        }
        else {
            if (previousRoute?.unload) previousRoute.unload()
            if (previousRoute !== route && route.load) route.load()
            await render(document.body, route.template())
            if (previousRoute !== route && route.afterTemplate) route.afterTemplate()

            previousRoute = route
        }
    }
    catch (exception) {
        render(document.body, html`<h3>Exception: ${exception.message}</h3>`)
    }
}

const previousLogin = localStorage.auth

if (previousLogin) {
    const [username, password] = previousLogin.split(':')
    Authentication.login(username, password).then((stillValid: boolean) => {
        if (!stillValid) goTo('/login')
    })
}

if (!Authentication.isLoggedIn()) goTo('/login')

renderApp()