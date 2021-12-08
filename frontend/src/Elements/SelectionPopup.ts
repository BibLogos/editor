import { HTML, render, html } from 'ube';
import { Create } from '../Plugins/PopupParts/Create';
import { Search } from '../Plugins/PopupParts/Search';
import { Actions } from '../Plugins/PopupParts/Actions';
import { DeleteForm } from '../Plugins/PopupParts/DeleteForm';
import { ObjectForm } from '../Plugins/PopupParts/ObjectForm';

const HTMLDiv = HTML.Div as typeof HTMLElement

const canceler = (event) => event.stopImmediatePropagation()

export class SelectionPopup extends HTMLDiv {

    private subject = ''
    private predicate = ''
    private object = ''
    private name = ''
    private comment = ''
    private selections
    private markings
    private form
    private markingsStore

    private popupParts

    constructor (selections, markingsStore) {
        super()
        this.selections = selections
        this.markingsStore = markingsStore
        this.markings = selections.flatMap(words => words.flatMap(word => word.markings))
        this.draw()
        this.addEventListener('mousedown', canceler)
        this.addEventListener('mouseup', canceler)
        this.addEventListener('click', canceler)
    }

    async upgradedCallback() {
        this.popupParts = [new Create(this), new Search(this), new Actions(this), new DeleteForm(this), new ObjectForm(this)]
        this.classList.add('selection-popup')
    }

    draw () {
        const popupPartsThatApply = this.popupParts.filter(popupPart => popupPart.applies())

        render(this, html`
            ${popupPartsThatApply.map(popupPart => popupPart.template())}
        `)
    }
}
 