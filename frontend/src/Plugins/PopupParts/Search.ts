import { html } from 'ube'
import { PopupPartInterface } from "../../types";
import { PopupPartbase } from '../../Classes/PopupPartBase';
import { t } from '../../Helpers/t';
import { unique } from '../../Helpers/unique';

export class Search extends PopupPartbase implements PopupPartInterface {

    private searchResults = null

    applies () {
        return this.selectionPopup.form === 'search'
    }

    template () {
        if (this.selectionPopup.predicate && this.searchResults === null) {
            const searchTerms = this.selectionPopup.selections
            .flatMap(words => words.map(word => word.text.replace(/[\p{P}$+<=>^`|~]/gu, '').trim()).join(' '))
            .filter(unique)

            this.selectionPopup.markingsStore.searchSubject(searchTerms, this.selectionPopup.predicate).then(searchResults => {
                this.searchResults = searchResults
                this.selectionPopup.draw()
            })
        }

        return html`
            <!--uhtml crashes without this-->
            ${this.selectionPopup.predicate && this.searchResults === null ? html`<span>${t`Searching...`}</span>` : html``}

            ${this.searchResults !== null ? (this.searchResults.length ? html`${this.searchResults.map(searchResult => html`
            <span class="existing-item">
                <span onclick=${() => {
                    this.selectionPopup.predicate = searchResult.predicate
                    throw new Error('Implement adding to store.')
                }} class="label">${searchResult.name}${searchResult.comment ? html`, ${searchResult.comment}` : html``}</span>
            </span>
            `)}` : html`
            <span class="label existing-item">${t`No results`}</span>
            `) : html``}
        `
    }
}