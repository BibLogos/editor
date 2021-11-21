import { html } from 'ube'
import { Route } from '../types'
import { BiblePicker } from '../Elements/BiblePicker'
import { BibleVerses } from '../Elements/BibleVerses'
import { renderApp } from '../app'
import { SelectionPopup } from '../Elements/SelectionPopup'

export const Editor: Route = {

    reference: {},

    observer: null,

    attachObserver: function () {
        if (this.observer) this.observer.disconnect()

        let options = {
            threshold: 1
        }

        // TODO improve on setting the hash.
        this.observer = new IntersectionObserver((entries) => {
            let firstEntry = null
            for (const entry of entries) {
                if (entry.isIntersecting && !firstEntry && entry.target.getAttribute('verse')) firstEntry = entry
            }

            if (firstEntry) {
                const verseString = firstEntry.target.getAttribute('verse')
                const verseSplit = verseString.split('.')
                const verse = verseSplit[2]
                const { bible, language, book, chapter } = this.reference
                location.hash = `${language}/${bible}/${book}/${chapter}/${verse}`
            }
        }, options)

        const verses = [...document.querySelectorAll('.scripture-styles .verse')]
        for (const verse of verses) this.observer.observe(verse)

        let [ _language, _bible, book, chapter, verse ] = location.hash.substr(1).split('/')

        const selector = `.verse[verse="${book}.${chapter}.${verse}"]`
        const verseElement = document.querySelector(selector)
        verseElement?.scrollIntoView()
    },

    unload: function () {
        this.observer?.disconnect()
    },

    template: function () {
        const { bible, language, book, chapter, verse } = this.reference

        return html`
            <${BiblePicker} onupdate=${(event) => { 
                this.reference = event.target.value
                renderApp()
             }} />

             ${this.reference ? html`
                <${BibleVerses} 
                onloaded=${() => this.attachObserver()}
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
                language=${language} bible=${bible} book=${book} chapter=${chapter} verse=${verse} />
            ` : null}
        `
    }

}