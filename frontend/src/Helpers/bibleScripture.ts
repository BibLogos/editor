import { html as syncHtml } from 'ube';
import { html } from 'uhtml/async';
import { referenceProxy } from './referenceProxy'
import { parseInts } from './parseInts'
import { stringToColor } from './stringToColor'

let counters = new Map()
let references

const tags = {
    'para': (part) => html`<p class=${`verse ${part?.attrs?.style ?? ''}`}>${part.items.map(recurse)}</p>`,
    'verse-span': (part) => {
        return html`<span verse=${part.attrs?.verseId} class=${`verse ${part?.attrs?.style ?? ''}`}>${part.items.map(recurse)}</span>`
    },
    'note': (part) => {
        return html`<note class=${part?.attrs?.style}></note>`
    },
    'ref': (part) => {
        return html`<span class=${part?.attrs?.style}></span>`
    },
    'verse': (part) => {
        return part.attrs?.number ?
        html`<sub class=${part?.attrs?.style}>${part.items.map(recurse)}</sub>` :
        html`<span class=${part?.attrs?.style}>${part.items.map(recurse)}</span>`
    },
    'char': (part) => html`<span class=${part?.attrs?.style}>${part.items.map(recurse)}</span>`,

}

const recurse = async (part) => {
    if (part.type == 'tag') {
        if (!tags[part?.name]) {
            console.error(part)
            throw new Error(`Can not handle`)
        }
        return tags[part?.name](part) 
    }

    if (part.type === 'text') {
        const words = part.text.split(' ')
        return html`${words.map(async (word, partIndex) => {
            if (!word) return html``
            let index = counters.get(part.attrs?.verseId) ?? 1

            const parts = part.attrs?.verseId ? [...parseInts([...part.attrs?.verseId.split('.'), index])] : []
            const highlight = part.attrs?.verseId ? references.find(reference => reference.includes(...parts)) : false

            const color = highlight ? highlight.color : null

            const template = html`<span title=${highlight?.object?.comment} style=${color ? `--color: ${color};` : null} verse=${part.attrs?.verseId} index=${index} class=${`word ${highlight ? 'highlight' : ''}`}>${word}${partIndex + 1 !== words.length ? ' ' : ''}</span>`

            if (part.attrs?.verseId) {
                index++
                counters.set(part.attrs?.verseId, index)    
            }

            return template
        })}`
    }

    console.error(part)
    throw new Error(`Can not handle`)
}

export const bibleScripture = async (parts, highlights: Array<any> = []) => {
    references = await Promise.all(highlights.map(async highlight => await new referenceProxy(highlight).makeColor()))
    counters.clear()
    const inner = await Promise.all(parts.map(recurse))
    return syncHtml`<div class="scripture-styles">${inner}</div>`
}