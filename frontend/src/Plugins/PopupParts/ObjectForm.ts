import { html } from 'ube'
import { PopupPartInterface } from "../../types";
import { PopupPartbase } from '../../Classes/PopupPartBase';

export class ObjectForm extends PopupPartbase implements PopupPartInterface {
    applies () {
        return ['edit', 'create'].includes(this.selectionPopup.form)
    }

    template () {
        console.log(this.selectionPopup.markingsStore)
        return html`<span>form</span>`    
    }
}