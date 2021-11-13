import {HTML, render, html} from 'ube';
import { FactPart } from '../types'

const factPartTypes = ['subject', 'predicate', 'object']

export class FactBasket extends HTML.Div {

    private classList: any

    private selections: Array<FactPart>

    upgradedCallback () {
        this.classList.add('fact-basket')
        this.selections = []
        this.draw()
    }

    add (factPart: FactPart) {
        this.selections.push(factPart)

        if (this.selections.length === 1 && this.selections[0].type !== 'predicate') {
            this.selections.push({
                type: 'predicate',
                elements: [],
                text: '',
            })
        }

        if (factPart.clear) factPart.clear()
        this.draw()
    }

    selector (value) {
        return html`
        <div class="select mini">
            <select>
                ${factPartTypes.map(type => html`<option ?selected=${value === type} value=${type}>${type}</option>`)}
            </select>
        </div>
        `
    }

    factPart (factPart: FactPart, inner = null) {
        return html`
            <div class="fact-part">
                ${this.selector(factPart.type)}
                ${factPart.text ? html`<span class="text">${factPart.text}</span>` : null}
                ${inner}
            </div>
        `
    }

    subject (factPart: FactPart) {
        return this.factPart(factPart)
    }

    predicate (factPart: FactPart) {
        return this.factPart(factPart)
    }

    object (factPart: FactPart) {
        return this.factPart(factPart)
    }

    draw () {
        console.log(this.selections)

        render(this, html`
            <div class="inner">
                ${this.selections.length ? html`
                    ${factPartTypes.map(type => {
                        const parts = this.selections.filter(factPart => factPart.type === type)
                        return html`<div class="column">
                            ${parts.map(factPart => this[factPart.type](factPart))}
                        </div>`
                    })}
                ` : html`
                    <p class="description">Click on a word at the start of a sentence you want to select, hold <em>shift</em> and click on the end of the sentence you want to select.</p>
                `}
            </div>
        `)
    }
}
 