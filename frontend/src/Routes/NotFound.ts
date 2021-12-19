import { html } from 'ube'
import { Route } from '../types'

export const NotFound: Route = {
    name: 'not-found',
    template: () => html`Not found`
}