import { html } from 'ube';

export const bibleScripture = (verses) => {
    const inner = verses.map(verse => {

        if (verse?.name === 'para') return html`
        <p class=${verse?.attrs?.style}>
            ${verse.items.map(item => html`<span>${item.text}</span>`)}
        </p>`
        
        return html`test`
    })    

    return html`<div class="scripture-styles">${inner}</div>`
}