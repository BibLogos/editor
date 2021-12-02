import { html } from 'ube'
import { Route } from '../types'
import { BiblePicker } from '../Elements/BiblePicker'
import { BibleVerses } from '../Elements/BibleVerses'
import { app } from '../app'
import { SelectionPopup } from '../Elements/SelectionPopup'

export const Editor: Route = {

    reference: {},

    unload: function () {
        document.removeEventListener('rerender-verses', this.rerender.bind(this))
    },

    rerender: function () {
        this.bibleVersesElement.redraw()
    },

    template: function () {
        const { bible, language, book, chapter, verse } = this.reference

        return html`
            <${BiblePicker} onupdate=${(event) => { 
                this.reference = event.target.value
                const { bible, language, book, chapter } = this.reference
                location.hash = `${language}/${bible}/${book}/${chapter}`

                app.render()
             }} />

             ${this.reference ? html`
                <${BibleVerses} 
                onloaded=${() => document.addEventListener('rerender-verses', this.rerender.bind(this))}
                ref=${element => this.bibleVersesElement = element} 
                onselection=${event => {
                    const oldPopups = document.querySelectorAll('.selection-popup')
                    for (const oldPopup of oldPopups) oldPopup.remove()
                    const firstWord = event.detail.elements.at(0)

                    if (firstWord) {
                        const newSelectionPopup = new SelectionPopup()
                        newSelectionPopup.creatingEvent = event.detail
                        firstWord.appendChild(newSelectionPopup)    
                    }
                }}
                language=${language} bible=${bible} book=${book} chapter=${chapter} />
            ` : null}
        `
    }

}