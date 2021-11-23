import { html as syncHtml } from 'ube';
import { html } from 'uhtml/async';
import { referenceProxy } from './referenceProxy'
import { parseInts } from './parseInts'
import { lastPart } from './lastPart'

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
            let index = counters.get(part.attrs?.verseId) ?? 1

            const parts = part.attrs?.verseId ? [...parseInts([...part.attrs?.verseId.split('.'), index])] : []
            const wordHighlights = part.attrs?.verseId ? references.filter(reference => reference.includes(...parts)) : []

            const personMarking = wordHighlights.find(wordHighlight => wordHighlight.object.predicate === 'https://biblogos.info/ttl/ontology#Person')

            const wordMarkings = wordHighlights.length ? html`<span class="markings">${
            wordHighlights.map(wordHighlight => html`
                <span class=${`marking ${lastPart(wordHighlight.object.predicate).toLowerCase()}`} style=${`--color: ${wordHighlight.color};`} title=${wordHighlight?.object?.comment}></span>`)
            }</span>` : html``

            const template = html`<span person=${personMarking?.object?.thing} verse=${part.attrs?.verseId} index=${index} class="word">${wordMarkings}${word}${partIndex + 1 !== words.length ? ' ' : ''}</span>`

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