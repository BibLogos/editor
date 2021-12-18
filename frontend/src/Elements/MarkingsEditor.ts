import { HTML, render, html } from 'ube';
import { github } from '../Services/Github'
import { lastPart } from '../Helpers/lastPart'
import { stringToColor } from '../Helpers/stringToColor'
import SelectionArea from '@viselect/vanilla'
import { goTo, params } from '../Core/Router';
import { BookNavigation } from '../Elements/BookNavigation'
import { app } from '../app';
import { t } from '../Helpers/t';
import { MarkingsStore } from '../Classes/MarkingsStore';

export class MarkingsEditor extends (HTML.Div as typeof HTMLElement) {

    private text
    public selection
    private markings
    private bigMarkings
    private book
    private markingsStore: MarkingsStore
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

    clear () {
        for (const selectedItem of [...this.querySelectorAll('.selected')]) {
            selectedItem.classList.remove('selected')
        }
        this.selection.clearSelection()
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
                let previousElement = selection.element.previousElementSibling.previousElementSibling
                if (previousElement.classList.contains('space')) {
                    previousElement = previousElement.previousElementSibling
                }
                if (previousElement !== previousSelection.element) {
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
        wordHighlights = wordHighlights
        .filter(wordHighlight => wordHighlight.reference.isShort)
        .sort((a, b) => b.reference.length - a.reference.length)

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

        <${BookNavigation} />

        <div params=${JSON.stringify(params)} ref=${element => this.element = element} class="markings-editor">
            ${this.text.map(([lineNumber, line, prefix, newLines], index) => {

                const prefixHighlights = this.markings
                .filter(({ reference }) => {
                    return reference.includes(bookAbbreviation, parseInt(chapterId), lineNumber, 1) &&
                    (lineNumber === 1 || reference.includes(bookAbbreviation, parseInt(chapterId), lineNumber - 1, this.text[index - 1].length))
                })

                const prefixMarkings = this.wordMarkings(prefixHighlights)

                let newlinesOutput = []
                const newlinesArray = new Array(newLines)
                for (const br of newlinesArray) newlinesOutput.push(html`<br><br>`)
                
                const words = line.split(' ')
                .map((word, index) => this.wordTemplate(chapterId, lineNumber, index + 1, word))
                return html.for(words)`${prefix ? prefix(prefixMarkings) : null}${words}${newlinesOutput}`
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

        <div class="right-spacer"></div>

        ` : html`<span>${t`Loading...`}</span>`)
    }
}
 