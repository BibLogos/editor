import { html } from 'ube'
import { PopupPartInterface } from "../../types";
import { PopupPartbase } from '../../Classes/PopupPartBase';
import { icon } from '../../Helpers/icon';
import { lastPart } from '../../Helpers/lastPart';
import { t } from '../../Helpers/t';

export class DeleteForm extends PopupPartbase implements PopupPartInterface {
    applies () {
        return this.selectionPopup.form === 'delete'
    }

    template () {
        const selectedMarking = this.selectionPopup.markings.find(marking => marking.subject === this.selectionPopup.subject)
        const type = lastPart(selectedMarking.predicate)

        return html`
            <span class="label existing-item">${type}: ${selectedMarking.name}</span>
            <button class="button nowrap">${icon('remove')}${t`Remove only this marking`}</button>
            <button class="button nowrap">${icon('bin')}${t`Remove every marking`}</button>
        `
    }
}