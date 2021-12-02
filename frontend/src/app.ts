import { render, html } from 'ube'
import { Router } from './Core/Router'

let previousRoute = null

class App {

    constructor () {
        this.render()
    }

    async render () {
        try {
            const route = await Router.resolve({ pathname: location.pathname })
            if (route.redirect) {
                const newUrl = route.redirect()
                if (newUrl.startsWith('http')) {
                    location.replace(newUrl)
                }
                else {
                    location.pathname = newUrl
                }
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
}

export const app = new App()
