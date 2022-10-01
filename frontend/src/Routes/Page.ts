import { Route } from '../types'
import { html } from 'ube'
import { SiteHeader } from '../Elements/SiteHeader'
import { Markdown } from '../Elements/Markdown'
import { params } from '../Core/Router'

export const Page: Route = {
    name: 'home',
    template: () => {
        let title

        return html`
            <${SiteHeader} .extra=${html`<h2 ref=${el => title = el} class="page-title"></h2>`} />
            <${Markdown} onready=${event => {
                title.innerHTML = event.detail.attributes.title
            }} class="route" .src=${params.name} />
        `
    }
}