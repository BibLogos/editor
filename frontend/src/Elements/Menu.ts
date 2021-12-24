import { HTML, render, html } from 'ube';
import { t } from '../Helpers/t';

export class Menu extends (HTML.Div as typeof HTMLDivElement) {

    async upgradedCallback() {
        this.draw()
        this.classList.add('menu')
    }

    draw () {
        render(this, html`

        <div onclick=${() => {
            console.log(document.body.dataset.menu)
            document.body.dataset.showMenu = document.body.dataset.showMenu !== 'true' ? 'true' : 'false'
        }} class="menu-toggle">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
        </div>
        `)
    }
}
 