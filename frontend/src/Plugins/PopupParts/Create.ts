import { html } from 'ube'
import { PopupPartInterface } from "../../types";
import { PopupPartbase } from '../../Classes/PopupPartBase';
import { icon } from '../../Helpers/icon';
import { select } from '../../Helpers/select';

export class Create extends PopupPartbase implements PopupPartInterface {

    private searchResults = null
    private factPredicates

    applies () {
        return !this.selectionPopup.form || this.selectionPopup.form === 'create-search'
    }

    template () {
        return this.selectionPopup.form === 'create-search' ? this.search() : this.button()
    }

    button () {
        return html`
        <button onclick=${() => { this.selectionPopup.form = 'create-search'; this.selectionPopup.draw() }} class="button nowrap">
            ${icon('add')} Create marking
        </button>`
    }

    search () {
        if (!this.factPredicates) {
            this.selectionPopup.markingsStore.getFactPredicates().then(factPredicates => {
                this.factPredicates = factPredicates
                this.selectionPopup.draw()
            })
        }

        if (this.selectionPopup.predicate && this.searchResults === null) {
            const searchTerms = this.selectionPopup.selections
            .flatMap(words => words.map(word => word.text.replace(/[\p{P}$+<=>^`|~]/gu, '').trim()).join(' '))

            this.selectionPopup.markingsStore.searchSubject(searchTerms, this.selectionPopup.predicate).then(searchResults => {
                this.searchResults = searchResults
                this.selectionPopup.draw()
            })
        }

        return html`
            <!--uhtml crashes without this-->
            ${!this.factPredicates ? html`<span>Loading...</span>` : html``}

            ${this.factPredicates ? select({
                title: 'Relation type',
                values: [
                    ['', '- Select -'],
                    ...this.factPredicates.map(factPredicate => [factPredicate.predicate, factPredicate.label])
                ].filter(([value]) => !this.selectionPopup.markings.find(marking => marking.predicate === value)), 
                onchange: (event) => {
                    this.selectionPopup.predicate = event.target.value
                    this.selectionPopup.draw()
                }
            }) : html``}

            ${this.selectionPopup.predicate && this.searchResults === null ? html`<span>Searching...</span>` : html``}

            ${this.searchResults !== null ? (this.searchResults.length ? html`${this.searchResults.map(searchResult => html`
            <span class="existing-item">
                <span onclick=${() => {
                    this.selectionPopup.predicate = searchResult.predicate
                    throw new Error('Implement adding to store.')
                }} class="label">${searchResult.name}${searchResult.comment ? html`, ${searchResult.comment}` : html``}</span>
            </span>
            `)}` : html`
            <span class="label existing-item">No results</span>
            `) : html``}

            ${this.selectionPopup.predicate ? html`
            <button onclick=${() => { 
                this.selectionPopup.form = 'create'; 
                this.selectionPopup.draw() 
            }} class="button nowrap">
                ${icon('add')} New marking
            </button>
            ` : html``}
        `
    }
}