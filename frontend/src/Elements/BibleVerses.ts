import { HTML, render, html } from 'ube'
import { ApiBible } from '../Services/ApiBible'
import { BibleReference } from '../types'
import { debounce } from '../Helpers/debounce'
import { bibleScripture } from '../Helpers/bibleScripture'
import SelectionArea from '@viselect/vanilla'
import { elementsToRange } from '../Helpers/elementsToRange'

export class BibleVerses extends HTML.Div {

    private debouncedDraw: any
    private versesMap: Map<string, any>
    private getAttribute: any
    private classList: any
    private dispatchEvent: any
    private range: string
    private querySelectorAll: any

    public reference: BibleReference
    static get observedAttributes() { return ['bible', 'book', 'chapter'] }

    attributeChangedCallback () {
        this.debouncedDraw()
    }

    async upgradedCallback() {
        this.range = ''
        this.versesMap = new Map()
        this.debouncedDraw = debounce(this.draw.bind(this), 200)
        this.classList.add('bible-verses')
        document.body.addEventListener('mouseup', this.clear.bind(this))
        this.draw()
    }
    
    async downgradedCallback () {
      document.body.removeEventListener('mouseup', this.clear.bind(this))
    }

    clear (event = null) {
      const popup = event?.target.closest('.selection-popup')
      if (!event || !event.target.classList.contains('word') && !popup) {
        const selectedWords = this.querySelectorAll('.word.selected')
        for (const selectedWord of selectedWords) selectedWord.classList.remove('selected')
        this.dispatchEvent(new CustomEvent('selection', { detail: { 
          range: null,
          elements: []
        }}))  
      }
    }

    draw () {
        const bible = this.getAttribute('bible')
        const book = this.getAttribute('book')
        const chapter = this.getAttribute('chapter')

        const cid = `${bible}-${book}-${chapter}`
        const isComplete = bible && book && chapter

        if (isComplete && !this.versesMap.get(cid)) {
            ApiBible.getVerses(bible, book, chapter).then(async verses => {
                this.versesMap.set(cid, verses.content)
                await this.draw()
                this.dispatchEvent(new CustomEvent('loaded'))
            })
        }

        render(this, html`
            <div class='inner'>
                ${isComplete && this.versesMap.has(cid) ? bibleScripture(this.versesMap.get(cid)) : html`loading...`}
            </div>
        `)

        const selection = new SelectionArea({
          selectables: ['.scripture-styles .word'],
          boundaries: ['.scripture-styles']
        })
        .on('beforedrag', ({ event }) => false)
        .on('start', ({ store, event }) => {
          if (!(event as MouseEvent).ctrlKey && !(event as MouseEvent).metaKey) {
            for (const el of store.stored) el.classList.remove('selected')
            selection.clearSelection()
          }
        })
        .on('move', ({ store: { changed: { added, removed } } }) => {
            for (const el of added) el.classList.add('selected')
            for (const el of removed) el.classList.remove('selected')
        })
        .on('stop', () => {
          const elements = [...this.querySelectorAll('.word.selected')]
          const range = elementsToRange(elements)
          if (range !== this.range) {
            this.range = range
            this.dispatchEvent(new CustomEvent('selection', { detail: { range, elements, clear: () => this.clear() }}))  
          }
        })
    }
}
 