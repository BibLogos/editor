import { parseInts } from "../Helpers/parseInts"
import { stringToColor } from "../Helpers/stringToColor"

export class ReferenceProxy {

    private startBook: string
    private startChapter: number
    private startVerse: number
    private startWord: number

    private endBook: string
    private endChapter: number
    private endVerse: number
    private endWord: number
    private _color: any

    private object

    constructor (reference) {
        const [start, end] = reference.split(':')

        const [startBook, startChapter, startVerse, startWord] = parseInts(start.split('.'))
        const startObject = {startBook, startChapter, startVerse, startWord}
        Object.assign(this, startObject)

        const [endBook, endChapter, endVerse, endWord] = parseInts(end.split('.'))    
        const endObject = {endBook, endChapter, endVerse, endWord}
        Object.assign(this, endObject)
    }

    includes (book, chapter, verse, word) {
        // For now we only support references that span over one book.
        if (book !== this.startBook && book !== this.endBook) return
        if (chapter < this.startChapter || chapter > this.endChapter) return
        if (verse < this.startVerse || verse > this.endVerse) return

        if (verse > this.startVerse && verse < this.endVerse) return true
        if (verse === this.startVerse && word >= this.startWord && word <= this.endWord) return true
        if (verse === this.endVerse && word >= this.startWord && word <= this.endWord) return true
    }

    get color () {
        return this._color
    }

    async makeColor () {
        this._color = await stringToColor(this.object.predicate)
        return this
    }
}
