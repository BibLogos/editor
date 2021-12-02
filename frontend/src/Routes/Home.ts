import { Route } from '../types'
import { html } from 'ube'
import { ProjectsOverview } from '../Elements/ProjectsOverview'

export const Home: Route = {
    template: () => {
        return html`
            <${ProjectsOverview} />
        `
    }
}