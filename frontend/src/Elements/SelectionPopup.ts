import { HTML, render, html } from 'ube';
import { CreateMarking } from '../Plugins/PopupParts/CreateMarking';
import { Search } from '../Plugins/PopupParts/Search';
import { Actions } from '../Plugins/PopupParts/Actions';
import { DeleteForm } from '../Plugins/PopupParts/DeleteForm';
import { ObjectForm } from '../Plugins/PopupParts/ObjectForm';
import { Predicates } from '../Plugins/PopupParts/Predicates';
import { NewMarking } from '../Plugins/PopupParts/NewMarking';
import { MarkingsStore } from '../Classes/MarkingsStore';

const canceler = (event) => event.stopImmediatePropagation()

export class SelectionPopup extends (HTML.Div as typeof HTMLElement) {

    public objectUri: ''
    public subject = ''
    public identifier = ''
    public predicate = ''
    public object = ''
    public name = ''
    public comment = ''
    public selections
    public markings
    public form
    public markingsStore: MarkingsStore

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
        this.popupParts = [
            new Predicates(this),
            new Search(this), 
            new Actions(this), 
            new DeleteForm(this), 
            new ObjectForm(this),
            new NewMarking(this),
            new CreateMarking(this), 
        ]
        this.classList.add('selection-popup')
    }

    draw () {
        const popupPartsThatApply = this.popupParts.filter(popupPart => popupPart.applies())

        render(this, html`
            ${popupPartsThatApply.map(popupPart => popupPart.template())}
        `)
    }
}
 