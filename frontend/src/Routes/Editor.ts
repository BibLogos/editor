import { html } from 'ube'
import { Route } from '../types'
import { MarkingsEditor } from '../Elements/MarkingsEditor'
import { SelectionPopup } from '../Elements/SelectionPopup'

export const Editor: Route = {
    template: function () {
        let markingsEditor

        return html`
            <${MarkingsEditor} ref=${element => markingsEditor = element} onclick=${(event) => {
                if (!event.target.classList.contains('word')) {
                    markingsEditor.clear()
                    document.querySelector('.selection-popup')?.remove()
                }
            }} class="route-editor" onselection=${(event) => {
                const selections = event.detail
                const firstWord = selections[0][0]?.element
                document.querySelector('.selection-popup')?.remove()
                
                if (firstWord) {
                    const popup = new SelectionPopup(selections, markingsEditor.markingsStore, markingsEditor)
                    firstWord.appendChild(popup)  
                }
                
            }} />
        `
    }

}