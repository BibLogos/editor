import { html } from 'ube'
import { Route } from '../types'
import { BiblePicker } from '../Elements/BiblePicker'
import { BibleVerses } from '../Elements/BibleVerses'
import { SelectionPopup } from '../Elements/SelectionPopup'
import { FactBasket } from '../Elements/FactBasket'
import { renderApp } from '../app'

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
        let popup
        let basket

        return html`
            <${SelectionPopup} ref=${element => popup = element} onaction=${event => basket.add(event.detail)} />

            <${BiblePicker} onupdate=${(event) => { 
                this.reference = event.target.value
                renderApp()
             }} />

             ${this.reference ? html`
                <${BibleVerses} 
                onloaded=${() => this.attachObserver()}
                onselection=${(event) => popup.trigger(event.detail.elements, event.detail.clear)}
                ref=${element => this.bibleVersesElement = element} 
                language=${language} bible=${bible} book=${book} chapter=${chapter} verse=${verse} />
            ` : null}

            <${FactBasket} ref=${element => basket = element} />
        `
    }

}