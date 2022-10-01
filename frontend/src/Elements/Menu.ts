import { HTML, render, html } from 'ube';
import { t } from '../Helpers/t';
import { icon } from '../Helpers/icon';
import { env } from '../Core/Env';

const menuItems = [
    [t`Home`, '/'],
    [t`About`, '/about'],
    [t`Login`, `${env.API}/login`],
    [t`GitHub`, 'https://github.com/BibLogos/editor'],
]

const toggleMenu = () => {
    document.body.dataset.showMenu = document.body.dataset.showMenu !== 'true' ? 'true' : 'false'
}

export class Menu extends (HTML.Div as typeof HTMLDivElement) {

    async upgradedCallback() {
        this.draw()
        this.classList.add('menu')
    }

    draw () {
        render(this, html`

        <div onclick=${toggleMenu} class="menu-toggle">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
        </div>

        <div class="menu-inner">
            <ul>
            <button class="close-menu button primary" onclick=${toggleMenu}>${icon('close')}</button>
            ${menuItems.map(([title, link]) => html`<li><a onclick=${toggleMenu} href=${link}>${title}</a></li>`)}
            </ul>
        </div>
        `)
    }
}
 