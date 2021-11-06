import { html } from 'ube'
import { Route } from '../types'
import { BiblePicker } from '../Elements/BiblePicker'
import { BibleVerses } from '../Elements/BibleVerses'
import { renderApp } from '../app'
import { getVersesFromSelection } from '../Helpers/getVersesFromSelection'

export const Editor: Route = {

    bibleVersesElement: null,
    reference: {},

    onmouseup: function (event) {
        const selection = document.getSelection()
        const text = selection.toString()

        if (text) {
            const verses = getVersesFromSelection(selection, this.bibleVersesElement)
            const startRange = selection.getRangeAt(0)
            const boundingRect = startRange.getBoundingClientRect()
            
            document.body.setAttribute('style', `
                --selection-popup-x: ${boundingRect.left + (boundingRect.width / 2)}px;
                --selection-popup-y: ${boundingRect.top + document.documentElement.scrollTop}px;
            `)

            console.log(boundingRect)
        }
    },

    beforeTemplate: function () {
        document.addEventListener('mouseup', this.onmouseup.bind(this))
    },

    unload: function () {
        document.removeEventListener('mouseup', this.onmouseup.bind(this))
    },

    template: function () {
        const { bible, language, book, chapter } = this.reference

        return html`
            <h1 class="page-title">Editor</h1>
            <div class="selection-popup">
                <button>Subject</button>
                <button>Predicate</button>
                <button>Object</button>
            </div>
            <${BiblePicker} onupdate=${(event) => { 
                this.reference = event.target.value
                const { bible, language, book, chapter } = this.reference
                location.hash = `${language}/${bible}/${book}/${chapter}`
                renderApp()
             }} />
            ${this.reference ? html`
                <${BibleVerses} ref=${element => this.bibleVersesElement = element} language=${language} bible=${bible} book=${book} chapter=${chapter} />
            ` : null}
        `
    }

}