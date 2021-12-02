import { html } from 'ube';
import { Database } from '../../Services/Database';
import { getState, clearState } from '../../Helpers/getState';
import { cleanString } from '../../Helpers/cleanString';
import { ApiBible } from '../.././Plugins/TextSources/ApiBible'

export const Textual = {
    template: function (predicateObject) {
        const state = getState(this, {
            results: null,
            bible: null,
            identifierField: null,
            selectedExistingItem: null,
            form: null,
            newObject: {
                name: '',
                identifier: '',
                comment: '',
            }
        })
    
        if (!state.bible) {
            ApiBible.getBibles().then(bibles => {
                state.bible = bibles.find(bible => bible.id === this.creatingEvent.bible)
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
    
        return html`
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
    }
    
}