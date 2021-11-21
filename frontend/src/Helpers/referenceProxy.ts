import { parseInts } from "./parseInts"
import { stringToColor } from "./stringToColor"

export class referenceProxy {

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

    constructor (object) {
        this.object = object
        const [start, end] = object.reference.split(':')

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

        if (verse > this.startVerse && verse < this.endVerse) return this.object
        if (verse === this.startVerse && word >= this.startWord && word <= this.endWord) return this.object
        if (verse === this.endVerse && word >= this.startWord && word <= this.endWord) return this.object
    }

    get color () {
        return this._color
    }

    async makeColor () {
        this._color = await stringToColor(this.object.predicate)
        return this
    }
}
