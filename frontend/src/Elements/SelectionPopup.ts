import { HTML, render, html } from 'ube';
import { elementsToRange } from '../Helpers/elementsToRange';
import { Database } from '../Services/Database';

export class SelectionPopup extends HTML.Div {

    private classList: any
    private dispatchEvent: any
    private selectedElements: Array<HTMLElement>
    private clearSelection
    private predicates: Array<{predicate: string, type: string, label: string}>

    async upgradedCallback() {
        this.classList.add('selection-popup')
        this.predicates = await Database.query(`
        SELECT * { 
            ?predicate a ?type ;                
                rdfs:label ?label .
            { ?predicate a rdfs:Class } UNION { ?predicate a rdfs:Property } .
        }`)

        console.log(this.predicates)

        this.draw()
    }

    trigger (selectedElements: Array<HTMLElement> = [], clearSelection) {
        this.clearSelection = clearSelection
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
                    clear: () => {
                        this.clear()
                        if (this.clearSelection) this.clearSelection()
                    },
                    type,
                    text: textTrimmed,
                    elements: this.selectedElements
                }
            }))
        }
    }

    draw () {
        render(this, html`
            <div class="select">
                <select>
                    <option selected disabled>- Choose -</option>
                    ${this.predicates.map(({ predicate, type, label }) => html`<option value=${`${type}:${predicate}`}>${label}</option>`)}
                </select>
                <div class="focus"></div>
            </div>
        `)
    }
}
 