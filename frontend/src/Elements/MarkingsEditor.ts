import { HTML, render, html } from 'ube';
import { github } from '../Services/Github'
import { lastPart } from '../Helpers/lastPart'
import { stringToColor } from '../Helpers/stringToColor'
import SelectionArea from '@viselect/vanilla'
import { goTo, params } from '../Core/Router';
import { BookNavigation } from '../Elements/BookNavigation'
import { app } from '../app';
import { t } from '../Helpers/t';

const HTMLDiv = HTML.Div as typeof HTMLElement

export class MarkingsEditor extends HTMLDiv {

    private text
    private selection
    private markings
    private bigMarkings
    private book
    private markingsStore
    private element

    async upgradedCallback() {
        await this.draw()
        await this.loadData()
        app.addEventListener('params-change', () => this.loadData())
    }

    async loadData () {
        let { ownerId, repoId, bookId, chapterId } = params
        const project = await github.getProject(ownerId, repoId)
        this.book = bookId ? project.books.find(book => book.name === bookId) : project.books[0]

        if (!bookId || !chapterId) {
            if (!bookId) bookId = this.book.name
            if (!chapterId) {
                const chapters = await this.book.getChapters()
                const [firstChapterId, _label] = chapters[0]
                chapterId = firstChapterId
            }
            goTo(`/editor/${ownerId}/${repoId}/${bookId}/${chapterId}`)
        }
       
        this.text = await this.book.getText(chapterId)
        this.markingsStore = await this.book.getMarkingsStore()
        this.markings = await this.markingsStore.getMarkings(chapterId)
        this.bigMarkings = this.markings.filter(marking => !marking.reference.isShort)

        await this.draw()
        this.createSelectionArea()
    }

    createSelectionArea () {
        const bookAbbreviation = this.book.settings.book
        let { chapterId } = params

        if (this.selection) this.selection.destroy()

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
            .map(word => {
                const lineNumber = parseInt(word.getAttribute('line-number'))
                const wordNumber = parseInt(word.getAttribute('word-number'))

                const markings = this.markings
                .filter(({ reference }) => reference.includes(bookAbbreviation, parseInt(chapterId), lineNumber, wordNumber))
       
                const popup = word.querySelector('.selection-popup')
                if (popup) popup.remove()
                const text = word.innerText.replace(/[\p{P}$+<=>^`|~]/gu, '').trim()
                if (popup) word.appendChild(popup)

                return {
                    lineNumber,
                    wordNumber,
                    text,
                    markings,
                    element: word
                }
            })

            const selectionGroups = new Set()
            let currentSelectionGroup = []
            for (const selection of selections) {
                if (currentSelectionGroup.length === 0) {
                    currentSelectionGroup.push(selection)
                    continue
                }

                const previousSelection = currentSelectionGroup.at(-1)
                if (selection.element.previousElementSibling.previousElementSibling !== previousSelection.element) {
                    if (currentSelectionGroup.length) selectionGroups.add(currentSelectionGroup)
                    currentSelectionGroup = []
                }

                currentSelectionGroup.push(selection)
            }
            selectionGroups.add(currentSelectionGroup)

            this.dispatchEvent(new CustomEvent('selection', { detail: [...selectionGroups.values()] }))
        })
    }

    wordMarkings (wordHighlights, isSpace = false, nextWordHighlights = []) {
        wordHighlights = wordHighlights.filter(wordHighlight => wordHighlight.reference.isShort)

        return html`<span class="markings">${
            wordHighlights.map(wordHighlight => {
                const highlightExistsInNextWord = nextWordHighlights.find(nextHighlight => nextHighlight.predicate === wordHighlight.predicate)

                return isSpace && !highlightExistsInNextWord ? html`` : html`
                <span class=${`marking ${lastPart(wordHighlight.predicate).toLowerCase()}`} 
                    style=${`--color: ${stringToColor(lastPart(wordHighlight.predicate).toLowerCase())};`} 
                    title=${wordHighlight?.comment}>
                </span>`
            })
        }</span>`
    }

    wordTemplate (chapterId, lineNumber, wordNumber, word) {
        const bookAbbreviation = this.book.settings.book
        const wordHighlights = this.markings
        .filter(({ reference }) => reference.includes(bookAbbreviation, parseInt(chapterId), lineNumber, wordNumber))

        const nextWordHighlights = this.markings
        .filter(({ reference }) => reference.includes(bookAbbreviation, parseInt(chapterId), lineNumber, wordNumber + 1))

        const personMarking = wordHighlights.find(wordHighlight => lastPart(wordHighlight.predicate) === 'Person')

        const title = wordHighlights.map(wordHighlight => {
            const comment = wordHighlight.comment
            const type = lastPart(wordHighlight.predicate)
            return comment ? comment + ', ' + type : type
        }).join('\n')

        return html`<span 
            title=${title} 
            person=${personMarking?.subject} 
            chapter-id=${chapterId}
            class="word" 
            word-number=${wordNumber} 
            line-number=${lineNumber}>${this.wordMarkings(wordHighlights, false, nextWordHighlights)}${word}</span><span 
            class="word space">${this.wordMarkings(wordHighlights, true, nextWordHighlights)} </span>`
    }

    async draw () {
        let { chapterId } = params
        const bookAbbreviation = this.book?.settings.book

        return render(this, this.text ? html`
        <div params=${JSON.stringify(params)} ref=${element => this.element = element} class="markings-editor">

            ${this.text.map(([lineNumber, line, prefix]) => {

                // TODO LOWPRIO can we prevent the case where a bible verse is marked and then the first word of the sentence and then nothing?
                const prefixHighlights = this.markings
                .filter(({ reference }) => reference.includes(bookAbbreviation, parseInt(chapterId), lineNumber, 1))

                const prefixMarkings = this.wordMarkings(prefixHighlights)

                const words = line.split(' ')
                .map((word, index) => this.wordTemplate(chapterId, lineNumber, index + 1, word))
                return html.for(words)`${prefix ? prefix(prefixMarkings) : null}${words}`
            })}

            ${this.bigMarkings.map(marking => {
                const type = lastPart(marking.predicate)
                return html`<div ref=${(element) => {
                    setTimeout(() => {
                        const startWord: HTMLElement = this.querySelector(`[chapter-id="${chapterId}"][line-number="${marking.reference.startVerse}"][word-number="${marking.reference.startWord}"]`)
                        const endWord: HTMLElement = this.querySelector(`[chapter-id="${chapterId}"][line-number="${marking.reference.endVerse}"][word-number="${marking.reference.endWord}"]`)

                        element.style.setProperty('--y1', (startWord.offsetTop - 6) + 'px')
                        element.style.setProperty('--y2', (endWord.offsetTop + 50) + 'px')
                        element.style.setProperty('--color', stringToColor(type.toLowerCase()))
                    })
                }} class="big-marking">
                    <span class="text">${marking.name}</span>
                </div>`
            })}

        </div>

        <${BookNavigation} />
        ` : html`<span>${t`Loading...`}</span>`)
    }
}
 