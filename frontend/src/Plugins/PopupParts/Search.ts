import { html } from 'ube'
import { PopupPartInterface } from "../../types";
import { PopupPartbase } from '../../Classes/PopupPartBase';
import { t } from '../../Helpers/t';
import { unique } from '../../Helpers/unique';
import { params } from '../../Core/Router';
import { app } from '../../app';
import { debounce } from '../../Helpers/debounce';

export class Search extends PopupPartbase implements PopupPartInterface {

    public searchResults = null

    applies () {
        return this.selectionPopup.predicate && this.selectionPopup.form === 'search'
    }

    template () {
        const doSearch = this.selectionPopup.predicate && 
        this.searchResults === null

        const noSubjectNeeded = this.selectionPopup.predicateType !== 'predicate'

        const subjectNeeded = this.selectionPopup.predicate && 
        this.searchResults === null && 
        this.selectionPopup.predicateType === 'predicate' &&
        this.selectionPopup.subject

        if (doSearch && (noSubjectNeeded || subjectNeeded)) {
            const searchTerms = this.selectionPopup.selections
            .flatMap(words => words.map(word => word.text.replace(/[\p{P}$+<=>^`|~]/gu, '').trim()).join(' '))
            .filter(unique)

            this.selectionPopup.markingsStore.searchSubject(searchTerms, this.selectionPopup.predicate).then(searchResults => {
                this.searchResults = searchResults
                this.selectionPopup.draw()
            })
        }

        return html`
            <input type="search" onkeyup=${debounce((event) => {
                this.selectionPopup.markingsStore.searchSubject(event.target.value.split(' '), this.selectionPopup.predicate).then(searchResults => {
                    this.searchResults = searchResults
                    this.selectionPopup.draw()
                })
            }, 100)} placeholder=${t`Search existing`}>

            <!--uhtml crashes without this-->
            ${this.searchResults !== null ? (this.searchResults.length ? html`${this.searchResults.map(searchResult => html`
            <span class="search-result">
                <span class="label" onclick=${async () => {
                    const { chapterId } = params

                    const book = this.selectionPopup.markingsStore.bookAbbreviation
        
                    const references = this.selectionPopup.selections.map(words => {
                        const firstWord = words.at(0)
                        const lastWord = words.at(-1)
                        const startReference = `${book}.${chapterId}.${firstWord.lineNumber}.${firstWord.wordNumber}`
                        const endReference = `${book}.${chapterId}.${lastWord.lineNumber}.${lastWord.wordNumber}`
                        return startReference + ':' + endReference 
                    })

                    await this.selectionPopup.markingsStore.appendFactReferences(searchResult.predicate, references)
                    this.selectionPopup.remove()
                    app.render()
                }}>${searchResult.name}${searchResult.comment ? html`, ${searchResult.comment}` : html``}</span>
            </span>
            `)}` : html``) : html``}
        `
    }
}