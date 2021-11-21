import { HTML, render, html } from 'ube'
import { ApiBible } from '../Services/ApiBible'
import { BibleReference } from '../types'
import { debounce } from '../Helpers/debounce'
import { bibleScripture } from '../Helpers/bibleScripture'
import { elementsToRange } from '../Helpers/elementsToRange'
import SelectionArea from '@viselect/vanilla'
import { Database } from '../Services/Database'

export class BibleVerses extends HTML.Div {

    private debouncedDraw: any
    private versesMap: Map<string, [any, any]>
    private getAttribute: any
    private classList: any
    private dispatchEvent: any
    private range: string
    private querySelectorAll: any
    private selection: any

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
        this.range = ''
        const selectedWords = this.querySelectorAll('.word.selected')
        for (const selectedWord of selectedWords) selectedWord.classList.remove('selected')
        this.selection.clearSelection()

        this.dispatchEvent(new CustomEvent('selection', { detail: { 
          range: null,
          elements: []
        }}))  
      }
    }

    async redraw () {
      this.versesMap.clear()
      this.draw()
    }

    async draw () {
        const bible = this.getAttribute('bible')
        const book = this.getAttribute('book')
        const chapter = this.getAttribute('chapter')

        const cid = `${bible}-${book}-${chapter}`
        const isComplete = bible && book && chapter

        if (isComplete && !this.versesMap.has(cid)) {
            ApiBible.getVerses(bible, book, chapter).then(async verses => {
                const bibleObject = (await ApiBible.getBibles().then(bibles => bibles.find(innerBible => innerBible.id === bible)))
                const highlights = await Database.getHighlights(bibleObject.abbreviation, book, chapter)

                this.versesMap.set(cid, [verses.content, highlights])
                await this.draw()
                this.dispatchEvent(new CustomEvent('loaded'))
            })
        }

        render(this, html`
            <div class='inner'>
                ${isComplete && this.versesMap.has(cid) ? await bibleScripture(...this.versesMap.get(cid)) : html`loading...`}
            </div>
        `)

        this.selection = new SelectionArea({
          selectables: ['.scripture-styles .word'],
          boundaries: ['.scripture-styles']
        })
        .on('beforedrag', ({ event }) => false)
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
          const elements = [...this.querySelectorAll('.word.selected')]
          
          const text = elements.map(word => word.innerText).join(' ').replace(/[\p{P}$+<=>^`|~]/gu, '').trim()
          const range = elementsToRange(elements)
          if (range !== this.range) {
            this.range = range
            this.dispatchEvent(new CustomEvent('selection', { detail: { 
              text, elements, range,
              book: this.getAttribute('book'),
              bible: this.getAttribute('bible')
            } }))
          }
        })
    }
}
 