import { html } from 'ube';
import { Database } from '../../Services/Database';
import { getState } from '../../Helpers/getState';
import { cleanString } from '../../Helpers/cleanString';
import { ApiBible } from '../../Services/ApiBible'

export const Form = {
    template: function (predicateObject) {
        const state = getState(this, {
            isSearching: false,
            results: null,
            showCreationForm: false,
            newObject: {
                name: this.creatingEvent.text,
                identifier: this.creatingEvent.text,
                comment: '',
            }
        })

        if (state.results === null) {
            state.isSearching = true

            Database.searchSubject(this.creatingEvent.text).then(results => {
                state.results = results
                state.isSearching = false
                this.draw()
            })
        }

        return state.showCreationForm ? html`
            <form class="predicate-part" onsubmit=${async event => {
                event.preventDefault()
                const bible = (await ApiBible.getBibles()).find(bible => bible.id === this.creatingEvent.bible)

                const turtle = `
                    ${bible.abbreviation}_${this.creatingEvent.book}:${cleanString(state.newObject.identifier)} a <${predicateObject.predicate}> ;
                        biblogos:name """${state.newObject.name}""" ;
                        biblogos:reference """${this.creatingEvent.range}""" ;
                        ${state.newObject.comment ? `biblogos:comment """${state.newObject.comment}""" .` : ''}
                `

                console.log(turtle)

            }}>
                <div class="field">
                    <label>Name</label>
                    <input type="text" .value=${state.newObject.name} onkeyup=${(event) => state.newObject.name = event.target.value} />
                </div>

                <div class="field">
                    <label>Identifier</label>
                    <input type="text" .value=${state.newObject.identifier} onkeyup=${(event) => state.newObject.identifier = event.target.value} />
                </div>

                <div class="field">
                    <label>Optional comment</label>
                    <textarea onkeyup=${(event) => state.newObject.comment = event.target.value}>${state.newObject.comment}</textarea>
                </div>

                <button class="button primary">Save</button>
            </form>` : html`
            <div class="predicate-part">
                ${state.isSearching ? html`<label>Searching...</label>` : html``}

                ${state.results?.length ? html`
                    <label>Select from the list:</label>
                    <ul class="result-list">
                        ${state.results.map(result => html`<li class="result-item">${result.label}</li>`)}
                    </ul>

                    <label>or:</label>
                ` : html``}

                ${!state.isSearching? html`
                    <button onclick=${() => { 
                        state.showCreationForm = true; this.draw() 
                    }} class="button primary">Create a new ${predicateObject.label.toLowerCase()}</button>
                ` : html``}
            </div>`
    }
}