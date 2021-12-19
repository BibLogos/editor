import { HTML, render, html } from 'ube';
import { t } from '../Helpers/t';
import { Menu } from './Menu';
import { BookNavigation } from './BookNavigation';

export class SiteHeader extends (HTML.Div as typeof HTMLDivElement) {

    async upgradedCallback() {
        this.draw()
        this.classList.add('site-header')
    }

    draw () {
        render(this, html`
            <a class="site-logo-link" href="/">
                <img class="favicon" src="/assets/favicon.svg">
                ${location.pathname === '/' ? html`<h1 class="logo-text">BibLogos</h1>` : null}
            </a>

            ${this['extra']}

            <${Menu} />
        `)
    }
}
 