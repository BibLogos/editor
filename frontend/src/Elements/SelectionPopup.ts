import { HTML, render, html } from 'ube';
import { Database } from '../Services/Database';
import { Mention } from './SelectionPopupForms/Mention';
import { Textual } from './SelectionPopupForms/Textual';
import { Predicate } from './SelectionPopupForms/Predicate';

const canceler = (event) => event.stopImmediatePropagation()

const helpers = {
    mention: Mention,
    textual: Textual,
    predicate: Predicate,
}

export class SelectionPopup extends HTML.Div {

    public creatingEvent: any
    private selectedPredicate: any
    private typeHelper: any
    private classList: any
    private addEventListener
    private setAttribute: any
    private predicates: Array<{predicate: string, type: string, label: string}>

    async upgradedCallback() {
        this.addEventListener('mousedown', canceler)
        this.addEventListener('mouseup', canceler)
        this.addEventListener('click', canceler)

        this.classList.add('selection-popup')
        this.predicates = await Database.getFactPredicates()

        this.draw()
    }

    predicateSelect (event) {
        const [type, ...rest] = event.target.value.split(':')
        this.selectedPredicate = this.predicates.find(item => item.predicate === rest.join(':'))
        this.typeHelper = helpers[type]
        this.setAttribute('type', type)

        this.draw()
    }

    draw () {
        render(this, html`
            <div class="select">
                <select onchange=${this.predicateSelect.bind(this)}>
                    <option selected disabled>- Choose -</option>
                    ${this.predicates.map(({ predicate, type, label }) => html`
                        <option value=${`${type}:${predicate}`}>${label}</option>
                    `)}
                </select>
                <div class="focus"></div>
            </div>

            ${this.typeHelper ? this.typeHelper.template.apply(this, [this.selectedPredicate]) : null}
        `)
    }
}
 