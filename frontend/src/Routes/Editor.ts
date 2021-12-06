import { html } from 'ube'
import { Route } from '../types'
import { MarkingsEditor } from '../Elements/MarkingsEditor'
import { SelectionPopup } from '../Elements/SelectionPopup'

export const Editor: Route = {

    template: function () {
        return html`
            <${MarkingsEditor} params=${this.params} class="editor" onselection=${(event) => {
                const selections = event.detail
                const firstWord = selections[0][0]?.[3]
                let currentPopup

                if (firstWord) {
                    currentPopup = firstWord.querySelector('.selection-popup')
                    if (!currentPopup) {
                        currentPopup = new SelectionPopup()
                        firstWord.appendChild(currentPopup)  
                    }
                }

                const popups = document.querySelectorAll('.selection-popup')

                for (const popup of popups) {
                    if (currentPopup !== popup) popup.remove()
                }
                
            }} />
        `
    }

}