import { HTML, render, html } from 'ube';
import { selectMaker } from '../Helpers/selectMaker'
import { ApiBible } from '../Services/ApiBible';
import { BibleReference } from '../types';

export type Bible = {
    abbreviation: string,
    abbreviationLocal: string,
    audioBibles: Array<any>,
    countries: Array<any>,
    dblId: string,
    description: string,
    descriptionLocal: string,
    id: string,
    language: Language,
    name: string,
    nameLocal: string,
    relatedDbl: string,
    type: string,
    updatedAt: string
}

export type Language = {
    id: string,
    name: string,
    nameLocal: string,
    script: string,
    scriptDirection: string
}

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
        this.current = { bible: '06125adad2d5898a-01', language: 'eng', book: 'GEN', chapter: 'intro' }
        this.isWorking = true
        this.select = selectMaker.bind(this)
        this.classList.add('bible-picker')
        this.draw()

        this.languages = await ApiBible.getLanguages()
        this.allBibles = await ApiBible.getBibles()

        await this.language('eng')
        await this.bible('06125adad2d5898a-01')
        await this.book('GEN', this.cid)
        await this.chapter('intro', this.cid)

        this.isWorking = false

        this.draw()
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

    draw () {
        for (const [key, value] of Object.entries(this.current)) {
            this.isWorking ? this.removeAttribute(key, value) : this.setAttribute(key, value)
        }   

        const transformedChapters = (this.chapters ?? []).map(chapter => {
            return {
                id: chapter.id.split('.')[1],
                name: chapter.number
            }
        })

        render(this, html`
            ${this.isWorking ? html`loading...` : html`
                ${this.languages ? this.select(this.languages, 'language', this.current) : null}
                ${this.bibles ? this.select(this.bibles, 'bible', this.current) : null}
                ${this.books ? this.select(this.books, 'book', this.current) : null}
                ${this.chapters ? this.select(transformedChapters, 'chapter', this.current) : null}            
            `}

        `)
    }
}
 