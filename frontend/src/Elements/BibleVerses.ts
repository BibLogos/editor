import { HTML, render, html } from 'ube';
import { ApiBible } from '../Services/ApiBible';
import { BibleReference } from '../types';
import { debounce } from '../Helpers/debounce';
import { bibleScripture } from '../Helpers/bibleScripture';

export class BibleVerses extends HTML.Div {

    private debouncedDraw: any
    private versesMap: Map<string, any>
    private getAttribute: any
    private classList: any

    public reference: BibleReference
    static get observedAttributes() { return ['bible', 'book', 'chapter'] }

    attributeChangedCallback () {
        this.debouncedDraw()
    }

    async upgradedCallback() {
        this.versesMap = new Map()
        this.debouncedDraw = debounce(this.draw.bind(this), 200)
        this.classList.add('bible-verses')
        this.draw()
    }

    draw () {
        const bible = this.getAttribute('bible')
        const book = this.getAttribute('book')
        const chapter = this.getAttribute('chapter')

        const cid = `${bible}-${book}-${chapter}`
        const isComplete = bible && book && chapter

        if (isComplete && !this.versesMap.get(cid)) {
            ApiBible.getVerses(bible, book, chapter).then(verses => {
                this.versesMap.set(cid, verses.content)
                this.draw()
            })
        }

        render(this, html`
            <div class="inner">
                ${isComplete && this.versesMap.has(cid) ? bibleScripture(this.versesMap.get(cid)) : html`loading...`}
            </div>
        `)
    }
}
 