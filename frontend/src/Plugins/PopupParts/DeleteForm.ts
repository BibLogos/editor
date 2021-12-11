import { html } from 'ube'
import { PopupPartInterface } from "../../types";
import { PopupPartbase } from '../../Classes/PopupPartBase';
import { icon } from '../../Helpers/icon';
import { lastPart } from '../../Helpers/lastPart';
import { t } from '../../Helpers/t';
import { app } from '../../app';

export class DeleteForm extends PopupPartbase implements PopupPartInterface {
    applies () {
        return this.selectionPopup.form === 'delete'
    }

    template () {
        const selectedMarkings = this.selectionPopup.markings.filter(marking => marking.subject === this.selectionPopup.subject)
        const selectedMarking = selectedMarkings[0]
        const references = selectedMarkings.map(marking => marking.reference.toString())
        const type = lastPart(selectedMarking.predicate)

        return html`
            <span class="label existing-item">${type}: ${selectedMarking.name}</span>
            <button class="button nowrap" onclick=${async () => {
                await this.selectionPopup.markingsStore.removeFactReferences(selectedMarking.subject, references)
                this.selectionPopup.remove()
                app.render()
            }}>${icon('remove')}${t`Remove only this marking`}</button>
            <button class="button nowrap" onclick=${async() => {
                await this.selectionPopup.markingsStore.deleteFact(selectedMarking.subject)
                this.selectionPopup.remove()
                app.render()
            }}>${icon('bin')}${t`Remove every marking`}</button>
        `
    }
}