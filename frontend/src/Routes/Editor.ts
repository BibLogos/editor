import { html, render } from 'ube'
import { Route } from '../types'
import { MarkingsEditor } from '../Elements/MarkingsEditor'
import { SelectionPopup } from '../Elements/SelectionPopup'
import { SiteHeader } from '../Elements/SiteHeader'
import { BookNavigation } from '../Elements/BookNavigation'

export const Editor: Route = {
    name: 'editor',
    template: function () {
        let markingsEditor

        return html`
            <${SiteHeader} .extra=${html`<${BookNavigation} />`} />
            <${MarkingsEditor} class="route" ref=${element => markingsEditor = element} onclick=${(event) => {
                if (!event.target.classList.contains('word')) {
                    console.log(1, event)
                    markingsEditor.clear()
                    document.querySelector('.selection-popup')?.remove()
                }
            }} class="route-editor" onselection=${(event) => {
                console.log(2, event)
                const selections = event.detail
                const firstWord = selections[0][0]?.element
                document.querySelector('.selection-popup')?.remove()
                
                if (firstWord) {
                    const root = document.createElement('div')
                    render(root, html`<${SelectionPopup} .selections=${selections} .markingsStore=${markingsEditor.markingsStore} .markingsEditor=${markingsEditor} />`)
                    const popup = root.children[0]
                    firstWord.appendChild(popup)  
                }
                
            }} />
        `
    }

}