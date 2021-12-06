import { render, html } from 'ube'
import { Router, context, params } from './Core/Router'

let previousRoute = null

class App extends EventTarget {

    constructor () {
        super()
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
                const oldParams = route.params
                route.params = params

                const paramsWereSame = oldParams === params

                if ((previousRoute !== route || !paramsWereSame) && route.load) {
                    route.load()
                }
                await render(document.body, route.template())

                if (previousRoute !== route) this.dispatchEvent(new CustomEvent('route-change'))
                if (previousRoute === route && !paramsWereSame) this.dispatchEvent(new CustomEvent('params-change'))

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
