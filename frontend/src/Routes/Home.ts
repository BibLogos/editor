import { Route } from '../types'
import { html } from 'ube'
import { ProjectsOverview } from '../Elements/ProjectsOverview'
import { SiteHeader } from '../Elements/SiteHeader'

export const Home: Route = {
    name: 'home',
    template: () => {
        return html`
            <${SiteHeader} />
            <${ProjectsOverview} />
        `
    }
}