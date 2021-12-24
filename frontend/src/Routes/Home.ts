import { Route } from '../types'
import { html } from 'ube'
import { ProjectsOverview } from '../Elements/ProjectsOverview'
import { SiteHeader } from '../Elements/SiteHeader'
import { Markdown } from '../Elements/Markdown'

export const Home: Route = {
    name: 'home',
    template: () => {
        return html`
            <${SiteHeader} />
            <${Markdown} class="route" .src=${'home'} />
            <${ProjectsOverview} />
        `
    }
}