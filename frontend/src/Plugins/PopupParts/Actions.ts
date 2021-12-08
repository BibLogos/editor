import { html } from 'ube'
import { PopupPartInterface } from "../../types";
import { PopupPartbase } from '../../Classes/PopupPartBase';
import { lastPart } from '../../Helpers/lastPart';
import { icon } from '../../Helpers/icon';

export class Actions extends PopupPartbase implements PopupPartInterface {
    applies () {
        return this.selectionPopup.markings.length && !this.selectionPopup.form
    }

    template () {
        return html`${this.selectionPopup.markings.map(marking => {
            const type = lastPart(marking.predicate).toLowerCase()
            return html`
            <span class="existing-item">
                <span class="label">${type}: ${marking.name}</span>
                <button class="button mini" onclick=${() => { 
                    this.selectionPopup.form = 'delete'
                    this.selectionPopup.subject = marking.subject
                    this.selectionPopup.draw() 
                }}>${icon('remove')}</button>
                <button class="button mini" onclick=${() => { 
                    this.selectionPopup.form = 'edit'
                    console.log(marking)
                    this.selectionPopup.subject = marking.subject
                    this.selectionPopup.name = marking.name
                    this.selectionPopup.comment = marking.comment
                    this.selectionPopup.draw() 
                }}>${icon('edit')}</button>
            </span>`
        })}`
    }
}