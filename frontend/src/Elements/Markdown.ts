import { HTML, render, html } from 'ube';
import { marked } from 'marked'
import { t } from '../Helpers/t';

export class Markdown extends (HTML.Div as typeof HTMLDivElement) {

    private src: string

    async upgradedCallback() {
        this.classList.add('markdown')
        const response = await fetch(`/markdown/${this.src}.md`)
        const text = await response.text()
        this.innerHTML = marked(text)
    }
}
 