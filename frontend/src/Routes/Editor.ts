import { html } from 'ube'
import { Route } from '../types'
import { github } from '../Services/Github'
import { app } from '../app'
import { lastPart } from '../Helpers/lastPart'
import { stringToColor } from '../Helpers/stringToColor'
import SelectionArea from '@viselect/vanilla'

export const Editor: Route = {

    load: async function () {
        let { ownerId, repoId, bookId, chapterId } = this.params
        const project = await github.getProject(ownerId, repoId)
        this.book = bookId ? project.books.find(book => book.name === bookId) : project.books[0]

        if (!this.params.bookId || !this.params.chapterId) return location.replace(`/${ownerId}/${repoId}/${this.book.name}/1`)
        
        this.text = await this.book.getText(chapterId)
        this.markingsStore = await this.book.getMarkingsStore()
        this.markings = await this.markingsStore.getMarkings(chapterId)

        app.render()
        if (!this.SelectionArea) this.createSelectionArea()
    },

    createSelectionArea: function () {
        this.selection = new SelectionArea({
            selectables: ['.word'],
            boundaries: ['.markings-editor']
        })
        .on('beforedrag', () => false)
        .on('start', ({ store, event }) => {
            if (!(event as MouseEvent).ctrlKey && !(event as MouseEvent).metaKey) {
                for (const el of store.stored) el.classList.remove('selected')
                this.selection.clearSelection()
            }
        })
        .on('move', ({ store: { changed: { added, removed } } }) => {
            for (const el of added) el.classList.add('selected')
            for (const el of removed) el.classList.remove('selected')
        })
        .on('stop', (event) => {
            // Add "selected" class to spaces that should also be highlighted.
            const spaces = [...this.element.querySelectorAll('.word.selected +.word.space')]
            for (const space of spaces) {
                if (space.nextElementSibling.classList.contains('selected')) {
                    space.classList.add('selected')
                }
            }

            // Remove "selected" class from spaces that should not be highlighted.
            const selectedSpaces = [...this.element.querySelectorAll('.word.space.selected')]
            for (const space of selectedSpaces) {
                if (
                    !space.previousElementSibling.classList.contains('selected') ||
                    !space.nextElementSibling.classList.contains('selected')
                ) {
                    space.classList.remove('selected')
                }
            }

            // Create an array containing selections from the selected elements.
            const selections = [...this.element.querySelectorAll('.word.selected')]
            .filter(word => word.hasAttribute('line-number'))
            .map(word => [
                parseInt(word.getAttribute('line-number')),
                parseInt(word.getAttribute('word-number')),
                word.innerText
            ])

            console.log(selections)
        })
    },

    wordTemplate: function (lineNumber, wordNumber, word) {
        let { chapterId } = this.params
        const bookAbbreviation = this.book.settings.book
        const wordHighlights = this.markings
        .filter(({ reference }) => reference.includes(bookAbbreviation, parseInt(chapterId), lineNumber, wordNumber))

        const personMarking = wordHighlights.find(wordHighlight => lastPart(wordHighlight.predicate) === 'Person')

        const title = wordHighlights.map(wordHighlight => {
            const comment = wordHighlight.comment
            const type = lastPart(wordHighlight.predicate)
            return comment ? comment + ', ' + type : type
        }).join('\n')

        const wordMarkings = wordHighlights.length ? html`<span class="markings">${
            wordHighlights.map(wordHighlight => html`
                <span class=${`marking ${lastPart(wordHighlight.predicate).toLowerCase()}`} 
                    style=${`--color: ${stringToColor(lastPart(wordHighlight.predicate).toLowerCase())};`} 
                    title=${wordHighlight?.comment}>
                </span>`)
            }</span>` : html``

        return html`<span 
            title=${title} 
            person=${personMarking?.thing} 
            class="word" 
            word-number=${wordNumber} 
            line-number=${lineNumber}>${wordMarkings}${word}</span><span class="word space"> </span>`
    },

    template: function () {
        return this.text ? html`
        <div ref=${element => this.element = element} class="markings-editor">
            ${this.text.map(([lineNumber, line, prefix]) => {
                const words = line.split(' ')
                .map((word, index) => this.wordTemplate(lineNumber, index + 1, word))
                return html`${prefix}${words}`
            })}
        </div>
        ` : html`<span>Loading...</span>`
    }

}