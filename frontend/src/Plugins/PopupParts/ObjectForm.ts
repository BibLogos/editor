import { html } from 'ube'
import { PopupPartInterface } from "../../types";
import { PopupPartbase } from '../../Classes/PopupPartBase';
import { t } from '../../Helpers/t';

export class ObjectForm extends PopupPartbase implements PopupPartInterface {
    applies () {
        return ['edit', 'create'].includes(this.selectionPopup.form)
    }

    template () {
        return html`
        <form class="predicate-part">
            <div class="field">
                <label>${t`Text`}</label>
                <input required type="text" .value=${this.selectionPopup.name} />
            </div>

            <div class="field">
                <label>${t`Identifier`}</label>
                <input required type="text" .value=${this.selectionPopup.subject} />
            </div>

            <div class="field">
                <label>${t`Optional comment`}</label>
                <textarea>${this.selectionPopup.comment}</textarea>
            </div>

            <button class="button primary">${t`Save`}</button>
        </form>`   
    }
}