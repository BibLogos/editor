import { html } from 'ube'
import { PopupPartInterface } from "../../types";
import { PopupPartbase } from '../../Classes/PopupPartBase';
import { icon } from '../../Helpers/icon';
import { lastPart } from '../../Helpers/lastPart';
import { t } from '../../Helpers/t';
import { app } from '../../app';

export class DeleteForm extends PopupPartbase implements PopupPartInterface {

    private count: number = null

    applies () {
        return this.selectionPopup.form === 'delete'
    }

    template () {

        if (this.count === null) {
            this.selectionPopup.markingsStore.getReferencesCountForFact(this.selectionPopup.subject).then(count => {
                this.count = count
                this.selectionPopup.draw()
            })
        }

        const selectedMarkings = this.selectionPopup.markings.filter(marking => marking.subject === this.selectionPopup.subject)
        const selectedMarking = selectedMarkings[0]
        const references = selectedMarkings.map(marking => marking.reference.toString())
        const type = lastPart(selectedMarking.predicate)

        return html`
            <span class="search-result">
            <span class="label">
            ${type}: ${selectedMarking.name}
            </span>
            </span>

            ${this.count > 1 ? html`
                <button class="button nowrap" onclick=${async () => {
                    await this.selectionPopup.markingsStore.removeFactReferences(selectedMarking.subject, references)
                    this.selectionPopup.remove()
                    app.render()
                }}>${icon('remove')}${t`Remove only this marking`}</button>
            ` : html``}

            <button class="button nowrap" onclick=${async() => {
                await this.selectionPopup.markingsStore.deleteFact(selectedMarking.subject)
                this.selectionPopup.remove()
                app.render()
            }}>${icon('bin')}${t`Remove every marking`}</button>
        `
    }
}