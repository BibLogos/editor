import { html } from 'ube'
import { Route } from '../types'
import { github } from '../Services/Github'
import { app } from '../app'
import { lastPart } from '../Helpers/lastPart'

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
    },

    wordTemplate: function (lineNumber, wordNumber, word) {
        let { chapterId } = this.params
        const bookAbbreviation = this.book.settings.book
        const wordHighlights = this.markings
        .filter(({ reference }) => reference.includes(bookAbbreviation, parseInt(chapterId), lineNumber, wordNumber))

        const personMarking = wordHighlights.find(wordHighlight => wordHighlight.predicate === 'https://biblogos.info/ttl/ontology#Person')

        const title = wordHighlights.map(wordHighlight => {
            const comment = wordHighlight.comment
            const type = lastPart(wordHighlight.predicate)
            return comment ? comment + ', ' + type : type
        }).join('\n')

        const wordMarkings = wordHighlights.length ? html`<span class="markings">${
            wordHighlights.map(wordHighlight => html`
                <span class=${`marking ${lastPart(wordHighlight.predicate).toLowerCase()}`} style=${`--color: ${wordHighlight.color};`} title=${wordHighlight?.comment}></span>`)
            }</span>` : html``

        return html`
        <span 
            title=${title} 
            person=${personMarking?.thing} 
            class="word" 
            word-number=${wordNumber} 
            line-number=${lineNumber}>
            ${wordMarkings}${word}
        </span>`
    },

    template: function () {
        return this.text ? html`
        <div>
            ${this.text.map(([lineNumber, line, prefix]) => {
                const words = line.split(' ')
                .map((word, index) => this.wordTemplate(lineNumber, index + 1, word))
                return html`${prefix}${words}`
            })}
        </div>
        ` : html`<span>Loading...</span>`
    }

}