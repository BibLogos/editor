import { html, render } from 'ube';

const tags = {
    'para': (part) => html`<p class=${part?.attrs?.style}>${part.items.map(recurse)}</p>`,
    'verse-span': (part) => {
        return html`<span verse=${part.attrs?.verseId} class=${part?.attrs?.style}>${part.items.map(recurse)}</span>`
    },
    'note': (part) => {
        // console.log(part)
        return html`<span class=${part?.attrs?.style}></span>`
    },
    'ref': (part) => {
        // console.log(part)
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
        if (part.attrs?.verseId) return html`<span verse=${part.attrs?.verseId}>${part.text}</span>`

        return part.text
    }

    console.error(part)
    throw new Error(`Can not handle`)
}

export const bibleScripture = (parts) => {
    const inner = parts.map(recurse)    
    return html`<div class="scripture-styles">${inner}</div>`
}