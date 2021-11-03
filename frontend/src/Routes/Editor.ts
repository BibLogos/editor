import { html } from 'ube'
import { Route } from '../types'
import { BiblePicker } from '../Elements/BiblePicker'

export const Editor: Route = {
    template: () => html`
        <h1>Editor</h1>
        <${BiblePicker} />
    `
}