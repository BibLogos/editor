import { parseInts } from "../Helpers/parseInts"

export class ReferenceProxy {

    private startBook: string
    private startChapter: number
    private startVerse: number
    private startWord: number

    private endBook: string
    private endChapter: number
    private endVerse: number
    private endWord: number

    private startNumber
    private endNumber

    #reference: string

    constructor (reference) {
        this.#reference = reference
        const [start, end] = reference.split(':')

        const [startBook, startChapter, startVerse, startWord] = parseInts(start.split('.'))
        const startObject = {startBook, startChapter, startVerse, startWord}
        Object.assign(this, startObject)

        const [endBook, endChapter, endVerse, endWord] = parseInts(end.split('.'))    
        const endObject = {endBook, endChapter, endVerse, endWord}
        Object.assign(this, endObject)

        this.startNumber = this.toNumber(startChapter, startVerse, startWord)
        this.endNumber = this.toNumber(endChapter, endVerse, endWord)
    }

    toNumber (chapter, verse, word) {
        return chapter * 10000 + verse * 1000 + word
    }

    includes (book, chapter, verse, word) {
        // For now we only support references that span over one book.
        if (book !== this.startBook && book !== this.endBook) return

        const number = this.toNumber(chapter, verse, word)

        return number >= this.startNumber && number <= this.endNumber
    }

    get isShort () {
        return this.startVerse + 4 > this.endVerse
    }

    get length () {
        return this.endNumber - this.startNumber
    }

    toString () {
        return this.#reference
    }
}
