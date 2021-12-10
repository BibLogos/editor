import { html } from 'ube'
import { PopupPartInterface } from "../../types";
import { PopupPartbase } from '../../Classes/PopupPartBase';
import { icon } from '../../Helpers/icon';
import { t } from '../../Helpers/t';

export class CreateMarking extends PopupPartbase implements PopupPartInterface {

    applies () {
        return !this.selectionPopup.form
    }

    template () {
        return html`
        <button onclick=${() => { this.selectionPopup.form = 'search'; this.selectionPopup.draw() }} class="button nowrap">
            ${icon('add')} ${t`Create marking`}
        </button>`
    }
}