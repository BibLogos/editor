import { html } from 'ube'
import { PopupPartInterface } from "../../types";
import { PopupPartbase } from '../../Classes/PopupPartBase';
import { t } from '../../Helpers/t';

export class Cancel extends PopupPartbase implements PopupPartInterface {

    applies () {
        return true
    }

    template () {
        return html`
        <button onclick=${() => { 
            this.selectionPopup.markingsEditor.clear()
            this.selectionPopup.remove()
        }} class="button cancel-button secondary nowrap">
            ${t`Cancel`}
        </button>`
    }
}