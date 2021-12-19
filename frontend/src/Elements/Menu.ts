import { HTML, render, html } from 'ube';
import { t } from '../Helpers/t';

export class Menu extends (HTML.Div as typeof HTMLDivElement) {

    async upgradedCallback() {
        this.draw()
        this.classList.add('menu')
    }

    draw () {
        render(this, html`

        ${this['menu-items']}

        <div class="menu-toggle">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
        </div>
        `)
    }
}
 