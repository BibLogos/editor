import { html } from 'ube'
import { Route, BibleReference } from '../types'
import { BiblePicker } from '../Elements/BiblePicker'
import { BibleVerses } from '../Elements/BibleVerses'
import { renderApp } from '../app'

export const Editor: Route = {

    reference: {},

    template: function () {
        const { bible, language, book, chapter } = this.reference

        return html`
            <h1>Editor</h1>
            <${BiblePicker} onupdate=${(event) => { this.reference = event.target.value; renderApp() }} />
            ${this.reference ? html`
                <${BibleVerses} language=${language} bible=${bible} book=${book} chapter=${chapter} />
            ` : null}
        `
    }

}