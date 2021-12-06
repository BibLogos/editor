import { HTML, render, html } from 'ube';

const HTMLDiv = HTML.Div as typeof HTMLElement

export class SelectionPopup extends HTMLDiv {

    async upgradedCallback() {
        this.classList.add('selection-popup')
        this.draw()
    }

    draw () {
        render(this, html`
            <span>hi</span>
        `)
    }
}
 