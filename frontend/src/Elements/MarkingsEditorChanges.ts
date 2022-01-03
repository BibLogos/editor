import { HTML, render, html } from 'ube';
import { MarkingsStore } from '../Classes/MarkingsStore';
import { t } from '../Helpers/t';
import { MarkingsEditorChange } from '../types'

const NAME = 'https://biblogos.info/ttl/ontology#name'
const TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
const REFERENCE = 'https://biblogos.info/ttl/ontology#reference'

export class MarkingsEditorChanges extends (HTML.Div as typeof HTMLElement) {

    private markingsStore: MarkingsStore

    async upgradedCallback() {
        this.draw()
        this.classList.add('markings-editor-change')
    }

    draw () {
        const changeCount = this.markingsStore.changes.length
        this.dataset.visible = (!!changeCount).toString()

        document.body.dataset.hasChanges = (!!changeCount).toString()

        render(this, changeCount ? html`
        <details class="changes">
            <summary>
                ${t`List of changes`} <em>(${this.markingsStore.changes.length})</em>
                <button class="primary button">${t`Save`}</button>

            </summary>

            <ul class="list">
                ${this.markingsStore.changes.map(transaction => {
                    const referenceChange = transaction.changes.find(([action, quad]) => quad.predicate.value === REFERENCE)
                    const [ _referenceAction, referenceQuad ] = referenceChange ?? []

                    const nameChange = transaction.changes.find(([action, quad]) => quad.predicate.value === NAME)
                    const [ _nameAction, nameQuad ] = nameChange ?? []

                    const reference = referenceQuad?.object.value
                    const name = nameQuad?.object.value

                    return html`
                        <li class="transaction">
                            <label>${transaction.label}: </label><strong>${name ?? reference ?? ''}</strong>
                        </li>
                    `
                })}
            </ul>
        </details>
        `  : html``)
    }
}
 