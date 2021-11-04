import { html } from 'ube'
import { Route, BibleReference } from '../types'
import { BiblePicker } from '../Elements/BiblePicker'
import { BibleVerses } from '../Elements/BibleVerses'
import { renderApp } from '../app'
import { unique } from '../Helpers/unique'

const getVersesFromSelection = (selection: Selection, root) => {
    const contained = []
    const nodeIterator = document.createNodeIterator(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT)
    
    while (nodeIterator.nextNode()) {
        const node = nodeIterator.referenceNode
        if (selection.containsNode(node)) contained.push(node)
    }

    const verses = []
    for (const node of contained) {
        const element = node.nodeName === '#text' ? node.parentElement : node
        const reference = element.hasAttribute('verse') ? element.getAttribute('verse') : element.closest('[verse]')?.getAttribute('verse')
        if (reference) {
            const verse = parseInt(reference.split('.').pop())
            verses.push(verse)
        }
    }

    return verses.filter(Boolean).filter(unique)
}

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
                --selection-popup-left: ${boundingRect.left + (boundingRect.width / 2)}px;
                --selection-popup-top: ${boundingRect.bottom + 20}px;
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
                Hello!
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