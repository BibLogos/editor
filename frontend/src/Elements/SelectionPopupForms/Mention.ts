import { html } from 'ube';
import { Database } from '../../Services/Database';
import { getState, clearState } from '../../Helpers/getState';
import { cleanString } from '../../Helpers/cleanString';
import { ApiBible } from '../../Services/ApiBible'
import { toCamelCase } from '../../Helpers/toCamelCase';

export const Mention = {
    template: function (predicateObject) {
        const state = getState(this, {
            isSearching: false,
            results: null,
            bible: null,
            showCreationForm: false,
            identifierField: null,
            selectedExistingItem: null,
            form: null,
            newObject: {
                name: this.creatingEvent.text,
                identifier: toCamelCase(this.creatingEvent.text),
                comment: '',
            }
        })
    
        if (!state.bible) {
            ApiBible.getBibles().then(bibles => {
                state.bible = bibles.find(bible => bible.id === this.creatingEvent.bible)
            })    
        }
    
        if (state.results === null) {
            state.isSearching = true
    
            Database.searchSubject(this.creatingEvent.text, predicateObject.predicate).then(results => {
                state.results = results
                state.isSearching = false
                this.draw()
            })
        }
    
        const createUri = () => {
            const bible = state.bible.abbreviation
            const book = this.creatingEvent.book
            const id = cleanString(state.newObject.identifier)
            const uri = `https://biblogos.info/facts/${bible}/${book}/${id}`
            return uri
        }
    
        const validate = async () => {
            const exists = await Database.uriExists(createUri())
            state.identifierField.setCustomValidity(exists ? 'This identifier is already taken, please use something else.' : '')
        }
        
        const createReference = async event => {
            event.preventDefault()
            await validate()
            state.form.reportValidity()
            if (!state.form.checkValidity()) return
    
            await Database.insertFact({
                uri: createUri(),
                name: state.newObject.name,
                predicate: predicateObject.predicate,
                range: this.creatingEvent.range,
                comment: state.newObject.comment
            })    
    
            clearState(this)
            document.querySelector('.bible-verses').clear()
            document.dispatchEvent(new CustomEvent('rerender-verses'))
            this.remove()
        }
    
        const addReference = async () => { 
            await Database.appendFactReference(state.selectedExistingItem.predicate, this.creatingEvent.range)
            clearState(this)
            document.querySelector('.bible-verses').clear()
            document.dispatchEvent(new CustomEvent('rerender-verses'))
            this.remove()    
        }
    
        /**
         * A couple of states:
         * 
         * - loading subjects with the same name
         * - results + button to create a new reference
         * - create a new reference form
         * - add a reference to an existing one
         */
        return state.showCreationForm ? html`
            <form ref=${(element) => state.form = element} class="predicate-part" onsubmit=${createReference}>
                <div class="field">
                    <label>Name</label>
                    <input required type="text" .value=${state.newObject.name} 
                    onkeyup=${(event) => state.newObject.name = event.target.value} />
                </div>
    
                <div class="field">
                    <label>Identifier</label>
                    <input ref=${element => state.identifierField = element} required type="text" 
                    .value=${state.newObject.identifier} onkeyup=${(event) => { 
                    state.newObject.identifier = event.target.value; validate() }} />
                </div>
    
                <div class="field">
                    <label>Optional comment</label>
                    <textarea onkeyup=${(event) => state.newObject.comment = event.target.value}>${state.newObject.comment}</textarea>
                </div>
    
                <button class="button primary">Save</button>
            </form>`
            : html`
            <div class="predicate-part">
                ${state.isSearching ? html`<label>Searching...</label>` : html``}
    
                ${state.results?.length && !state.selectedExistingItem ? html`
                    <label>Select from the list:</label>
                    <ul class="result-list">
                        ${state.results.map(result => html`
                            <li class="result-item" onclick=${(event) => { state.selectedExistingItem = result; this.draw() }}>
                                ${result.name} ${result.comment ? html` <em>(${result.comment})</em>` : null}
                            </li>`)}
                    </ul>
    
                    <label>or:</label>
                ` : html``}
    
                ${state.selectedExistingItem ? html`
                <div class="result-item">
                    ${state.selectedExistingItem.name} ${state.selectedExistingItem.comment ? 
                        html` <em>(${state.selectedExistingItem.comment})</em>` : null}
                </div>
    
                <button onclick=${addReference} class="button primary">Save reference</button>
                ` : html``}
    
                ${!state.isSearching && !state.selectedExistingItem ? html`
                    <button onclick=${() => { state.showCreationForm = true; this.draw() }} class="button primary">
                        Create a new ${predicateObject.label.toLowerCase()}
                    </button>
                ` : html``}
            </div>`
    }
    
}
