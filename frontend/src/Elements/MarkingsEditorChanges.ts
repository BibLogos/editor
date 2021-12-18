import { HTML, render, html } from 'ube';
import { t } from '../Helpers/t';
import { MarkingsEditorChange } from '../types'

export class MarkingsEditorChanges extends (HTML.Div as typeof HTMLElement) {

    private changes: Array<MarkingsEditorChange>

    async upgradedCallback() {
        this.draw()
    }

    draw () {
        console.log(this.changes)
        render(this, html`
        <ul class="changes">

        </ul>
        `)
    }
}
 