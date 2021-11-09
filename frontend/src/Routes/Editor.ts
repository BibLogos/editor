import { html } from 'ube'
import { Route } from '../types'
import { BiblePicker } from '../Elements/BiblePicker'
import { BibleVerses } from '../Elements/BibleVerses'
import { SelectionPopup } from '../Elements/SelectionPopup'
import { renderApp } from '../app'

export const Editor: Route = {

    reference: {},

    template: function () {
        const { bible, language, book, chapter } = this.reference

        return html`
            <${SelectionPopup} />

            <${BiblePicker} onupdate=${(event) => { 
                this.reference = event.target.value
                const { bible, language, book, chapter } = this.reference
                location.hash = `${language}/${bible}/${book}/${chapter}`
                renderApp()
             }} />

             ${this.reference ? html`
                <${BibleVerses} 
                ref=${element => this.bibleVersesElement = element} 
                language=${language} bible=${bible} book=${book} chapter=${chapter} />
            ` : null}
        `
    }

}