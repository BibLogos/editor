import { html, render } from 'ube';

let counters = new Map()

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

const recurse = (part) => {
    if (part.type == 'tag') {
        if (!tags[part?.name]) {
            console.error(part)
            throw new Error(`Can not handle`)
        }
        return tags[part?.name](part) 
    }

    if (part.type === 'text') {
        const words = part.text.split(' ')
        return html`${words.map((word, partIndex) => {
            let index = counters.get(part.attrs?.verseId) ?? 1

            const template = html`<span verse=${part.attrs?.verseId} index=${index} class="word">${word}${partIndex + 1 !== words.length ? ' ' : ''}</span>`

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

export const bibleScripture = (parts) => {
    counters.clear()
    const inner = parts.map(recurse)
    return html`<div class="scripture-styles">${inner}</div>`
}