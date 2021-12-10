import { html } from 'ube'
import { PopupPartInterface } from "../../types";
import { PopupPartbase } from '../../Classes/PopupPartBase';
import { icon } from '../../Helpers/icon';
import { t } from '../../Helpers/t';
import { toCamelCase } from '../../Helpers/toCamelCase'

export class NewMarking extends PopupPartbase implements PopupPartInterface {

    applies () {
        return this.selectionPopup.form === 'search' && this.selectionPopup.predicate
    }

    template () {
        return html`
        <button onclick=${() => { 
            const words = this.selectionPopup.selections.flatMap(words => words.map(word => word.text).join(' ')).join(' ')
            this.selectionPopup.name = words
            this.selectionPopup.identifier = toCamelCase(words)
            this.selectionPopup.form = 'create'
            this.selectionPopup.draw() 
        }} class="button nowrap">
            ${icon('add')} ${t`New marking`}
        </button>`
    }
}