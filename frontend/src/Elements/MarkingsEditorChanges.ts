import { HTML, render, html } from 'ube';
import { MarkingsStore } from '../Classes/MarkingsStore';
import { Project } from '../Classes/Project';
import { params } from '../Core/Router';
import { saveChanges } from '../Helpers/saveChanges';
import { t } from '../Helpers/t';
import { github } from '../Services/Github';
import { env } from '../Core/Env';
import { app } from '../app';

const NAME = 'https://biblogos.info/ttl/ontology#name'
const TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
const REFERENCE = 'https://biblogos.info/ttl/ontology#reference'

export class MarkingsEditorChanges extends (HTML.Div as typeof HTMLElement) {

    private project: Project
    private markingsStore: MarkingsStore
    private isLoggedIn: boolean
    private isWorking: boolean

    async upgradedCallback() {
        this.isLoggedIn = !!localStorage.githubToken
        github.isLoggedIn().then(isReallyLoggedIn => {
            this.isLoggedIn = isReallyLoggedIn
            this.draw()
        })
        
        this.isWorking = false
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

                ${this.isLoggedIn ? html`
                <button onclick=${async () => {
                    this.isWorking = true
                    this.draw()
                    const turtle = await this.markingsStore.serialize()
                    await saveChanges(this.project, params, turtle)
                    this.markingsStore.changes = []
                    app.render(true)
                    this.isWorking = false
                    this.draw()
                }} class=${`primary button ${this.isWorking ? 'is-working': ''}`}>${this.isWorking ? t`Saving...` : t`Save`}</button>
                ` : html`
                <button onclick=${async () => {
                    const redirectUrl = `${env.API}/login`
                    localStorage.redirectUrl = location.pathname
                    location.replace(redirectUrl)                
                }} class="primary button">${t`Login with GitHub to save`}</button>
                `}

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
 