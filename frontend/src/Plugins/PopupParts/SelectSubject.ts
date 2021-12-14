import { html } from 'ube'
import { PopupPartInterface } from "../../types";
import { PopupPartbase } from '../../Classes/PopupPartBase';
import { t } from '../../Helpers/t';

export class SelectSubject extends PopupPartbase implements PopupPartInterface {

    applies () {
        return this.selectionPopup.predicate && 
        this.selectionPopup.form === 'search' && 
        this.selectionPopup.predicateType === 'predicate' &&
        !this.selectionPopup.subject
    }

    textClick (event) {
        event.stopImmediatePropagation()
        if (!event.target.classList?.contains('word')) return
        const personUri = event.target.getAttribute('person')
        event.target.classList.add('selected')
        this.selectionPopup.subject = personUri
        this.selectionPopup.form = 'search'
        this.selectionPopup.draw()
    }

    template () {
        document.querySelector('.markings-editor').addEventListener('mouseup', this.textClick.bind(this), {
            once: true
        })

        return html`
        <span class="existing-item">
            <span class="label">${t`Select the subject`}</span>
        </span>
        `
    }
}