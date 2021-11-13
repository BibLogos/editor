import { HTML, render, html } from 'ube';
import { elementsToRange } from '../Helpers/elementsToRange';

export class SelectionPopup extends HTML.Div {

    private classList: any
    private dispatchEvent: any
    private selectedElements: Array<HTMLElement>

    async upgradedCallback() {
        this.classList.add('selection-popup')
        this.draw()
    }

    trigger (selectedElements: Array<HTMLElement> = []) {
        this.selectedElements = selectedElements
        if (selectedElements.length === 0) return this.clear()
        const element = selectedElements.at(-1)
        const boundingRect = element.getBoundingClientRect()
        
        document.documentElement.style.setProperty('--selection-popup', '1')
        document.documentElement.dataset.selectionPopup = true.toString()
        document.documentElement.style.setProperty('--selection-popup-x', `${boundingRect.left + (boundingRect.width / 2)}px`)
        document.documentElement.style.setProperty('--selection-popup-y', `${boundingRect.top + document.documentElement.scrollTop}px`)
    }

    clear () {
        document.documentElement.style.setProperty('--selection-popup', '0')
        document.documentElement.dataset.selectionPopup = false.toString()
    }

    action (type: string) {
        return () => {
            const text = this.selectedElements.map(word => word.innerText).join('').trim()
            const regex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g
            const textTrimmed = text.replace(regex, '')

            this.dispatchEvent(new CustomEvent('action', {
                detail: {
                    range: elementsToRange(this.selectedElements),
                    clear: () => this.clear(),
                    type,
                    text: textTrimmed,
                    elements: this.selectedElements
                }
            }))
        }
    }

    draw () {
        render(this, html`
            <button class="button" onclick=${this.action('subject').bind(this)}>Subject</button>
            <button class="button" onclick=${this.action('predicate').bind(this)}>Predicate</button>
            <button class="button" onclick=${this.action('object').bind(this)}>Object</button>
        `)
    }
}
 