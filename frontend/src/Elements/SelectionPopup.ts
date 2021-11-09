import { HTML, render, html } from 'ube';
import { getVersesFromSelection } from '../Helpers/getVersesFromSelection'

export class SelectionPopup extends HTML.Div {

    private classList: any

    async upgradedCallback() {
        this.classList.add('selection-popup')
        document.addEventListener('mouseup', this.onmouseup.bind(this))
        this.draw()
    }

    async downgradedCallback () {
        document.removeEventListener('mouseup', this.onmouseup.bind(this))
    }

    onmouseup () {
        const selection = document.getSelection()

        const text = selection.toString()
        if (!text) return this.clearPopup()

        const verses = getVersesFromSelection(selection, document.querySelector('.bible-verses'))
        if (!verses.length) return this.clearPopup()

        const startRange = selection.getRangeAt(0)
        const boundingRect = startRange.getBoundingClientRect()
        
        document.documentElement.style.setProperty('--selection-popup', '1')
        document.documentElement.style.setProperty('--selection-popup-x', `${boundingRect.left + (boundingRect.width / 2)}px`)
        document.documentElement.style.setProperty('--selection-popup-y', `${boundingRect.top + document.documentElement.scrollTop}px`)

        console.log(selection)
    }

    clearPopup () {
        document.documentElement.style.setProperty('--selection-popup', '0')
    }

    draw () {
        render(this, html`
            <button class="button">Subject</button>
            <button class="button">Predicate</button>
            <button class="button">Object</button>
        `)
    }
}
 