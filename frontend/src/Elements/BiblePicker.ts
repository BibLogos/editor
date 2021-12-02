import { HTML, render, html } from 'ube';
import { selectMaker } from '../Helpers/selectMaker'
import { ApiBible } from '../Plugins/TextSources/ApiBible';
import { BibleReference, Language, Bible } from '../types';

export class BiblePicker extends HTML.Div {

    private current: BibleReference
    private classList: any

    private languages: Array<Language>
    private bibles: Array<Bible>
    private books: Array<any>
    private chapters: Array<any>

    private removeAttribute: any
    private setAttribute: any
    private dispatchEvent: any

    private allBibles: Array<Bible>
    private select: typeof selectMaker

    public isWorking: boolean

    private previousValue

    async upgradedCallback() {
        let [ language, bible, book, chapter, verse ] = location.hash.substr(1).split('/')
        if (!language) language = 'eng'
        if (!bible) bible = '06125adad2d5898a-01'
        if (!book) book = 'GEN'
        if (!chapter) chapter = 'intro'
        if (!verse) verse = '1'

        this.current = { bible, language, book, chapter }
        this.isWorking = true
        this.select = selectMaker.bind(this)
        this.classList.add('bible-picker')
        await this.draw()

        this.languages = await ApiBible.getLanguages()
        this.allBibles = await ApiBible.getBibles()

        await this.language(language)
        await this.bible(bible)
        await this.book(book, this.cid)
        await this.chapter(chapter, this.cid)

        this.isWorking = false

        await this.draw()
    }

    get cid () {
        return JSON.stringify(this.current)
    }

    async language (value) {
        this.current.language = value
        this.bibles = this.allBibles.filter(bible => bible.language.id === this.current.language)

        const currentBibleExistsInSelectedLanguage = this.bibles.find(bible => bible.id === this.current.bible)
        await this.bible(currentBibleExistsInSelectedLanguage ? this.current.bible : this.bibles[0].id)
    }

    async bible (value) {
        this.current.bible = value
        this.books = await ApiBible.getBooks(this.current.bible)

        const currentBookExistsInSelectedBible = this.books.find(book => book.id === this.current.book)
        await this.book(currentBookExistsInSelectedBible ? this.current.book : this.books[0].id, this.cid)
    }

    async book (value, _cacheKey) {
        this.current.book = value
        this.chapters = await ApiBible.getChapters(this.current.bible, this.current.book)

        const currentChapterExistsInSelectedBook = this.chapters.find(chapter => chapter.id === this.current.chapter)
        await this.chapter(currentChapterExistsInSelectedBook ? this.current.chapter : this.chapters[0].id.split('.')[1], this.cid)
    }

    async chapter (value, _cacheKey) {
        this.current.chapter = value

        const currentString = JSON.stringify(this.current)
        const previousString = JSON.stringify(this.previousValue)

        if (currentString !== previousString) {
            this.previousValue = Object.assign({}, this.current)
            this.dispatchEvent(new CustomEvent('update', {
                detail: this.current
            }))
        }
    }

    get value () {
        return this.current
    }

    async draw () {
        for (const [key, value] of Object.entries(this.current)) {
            this.isWorking ? this.removeAttribute(key, value) : this.setAttribute(key, value)
        }   

        const transformedChapters = (this.chapters ?? []).map(chapter => {
            return {
                id: chapter.id.split('.')[1],
                name: chapter.number
            }
        })

        await render(this, html`
            <div class="inner">
                ${this.isWorking ? html`loading...` : html`
                    ${this.languages ? this.select('Language', this.languages, 'language', this.current) : null}
                    ${this.bibles ? this.select('Bible', this.bibles, 'bible', this.current) : null}
                    ${this.books ? this.select('Book', this.books, 'book', this.current) : null}
                    ${this.chapters ? this.select('Chapter', transformedChapters, 'chapter', this.current) : null}            
                `}
            </div>
        `)
    }
}
 