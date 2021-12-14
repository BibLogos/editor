import { html } from 'ube'
import { PopupPartInterface } from "../../types";
import { PopupPartbase } from '../../Classes/PopupPartBase';
import { icon } from '../../Helpers/icon';
import { t } from '../../Helpers/t';
import { toCamelCase } from '../../Helpers/toCamelCase'
import { lastPart } from '../../Helpers/lastPart';

export class NewMarking extends PopupPartbase implements PopupPartInterface {

    applies () {
        const base = this.selectionPopup.predicate && this.selectionPopup.form === 'search'
        const defaultPredicateType = this.selectionPopup.predicateType !== 'predicate'
        const subjectPredicateType = this.selectionPopup.subject && this.selectionPopup.predicateType === 'predicate'

        return base && (defaultPredicateType || subjectPredicateType)
    }

    buttonClick () {
        const words = this.selectionPopup.selections.flatMap(words => words.map(word => word.text).join(' ')).join(' ')
        const subject = this.selectionPopup.subject ? lastPart(this.selectionPopup.subject) : null
        
        this.selectionPopup.name = words
        this.selectionPopup.identifier = toCamelCase((subject ?? '') + ' ' + words)
        this.selectionPopup.form = 'create'
        this.selectionPopup.draw()
    }

    template () {
        return html`
        <button onclick=${this.buttonClick.bind(this)} class="button nowrap">
            ${icon('add')} ${t`New marking`}
        </button>`
    }
}