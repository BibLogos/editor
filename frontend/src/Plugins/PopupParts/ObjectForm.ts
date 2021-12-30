import { html } from 'ube'
import { PopupPartInterface } from "../../types";
import { PopupPartbase } from '../../Classes/PopupPartBase';
import { t } from '../../Helpers/t';
import { params } from '../../Core/Router';
import { app } from '../../app';

export class ObjectForm extends PopupPartbase implements PopupPartInterface {
    applies () {
        return ['edit', 'create'].includes(this.selectionPopup.form)
    }

    template () {
        return html`
        <form class="predicate-part" onsubmit=${async (event) => {
            event.preventDefault()

            const { ownerId, repoId, chapterId } = params

            const book = this.selectionPopup.markingsStore.bookAbbreviation

            const references = this.selectionPopup.selections.map(words => {
                const firstWord = words.at(0)
                const lastWord = words.at(-1)
                const startReference = `${book}.${chapterId}.${firstWord.lineNumber}.${firstWord.wordNumber}`
                const endReference = `${book}.${chapterId}.${lastWord.lineNumber}.${lastWord.wordNumber}`
                return startReference === endReference ? startReference : startReference + ':' + endReference 
            })

            await this.selectionPopup.markingsStore.insertFact({
                uri: `https://biblogos.info/${ownerId}/${repoId}/${this.selectionPopup.identifier}`,
                name: this.selectionPopup.name,
                predicate: this.selectionPopup.predicate,
                subject: this.selectionPopup.subject,
                references: references,
                comment: this.selectionPopup.comment
            })

            this.selectionPopup.remove()
            app.render()
        }}>
            <div class="field">
                <label>${t`Text`}</label>
                <input required type="text" 
                    onchange=${event => this.selectionPopup.name = event.target.value} 
                    .value=${this.selectionPopup.name} />
            </div>

            <div class="field">
                <label>${t`Identifier`}</label>
                <input required type="text" 
                    onchange=${event => this.selectionPopup.identifier = event.target.value} 
                    .value=${this.selectionPopup.identifier} />
            </div>

            <div class="field">
                <label>${t`Optional comment`}</label>
                <textarea onchange=${event => this.selectionPopup.comment = event.target.value}>${this.selectionPopup.comment}</textarea>
            </div>

            <button class="button primary">${t`Save`}</button>
        </form>`   
    }
}