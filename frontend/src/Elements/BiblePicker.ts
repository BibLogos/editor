import {HTML, render, html} from 'ube';
import { inputUpdater } from '../Helpers/inputUpdater'
import { goTo } from '../Core/Router'
import { ApiBible } from '../Services/ApiBible';

export class BiblePicker extends HTML.Div {

    async upgradedCallback() {
        const bibles = await ApiBible.getBibles()

        console.log(bibles)

        this.draw()
    }

    draw () {
        render(this, html`
            <input type="search" />
        `)
    }
}
 