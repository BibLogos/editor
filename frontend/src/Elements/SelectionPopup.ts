import { HTML, render, html } from 'ube';
import { CreateMarking } from '../Plugins/PopupParts/CreateMarking';
import { Search } from '../Plugins/PopupParts/Search';
import { Actions } from '../Plugins/PopupParts/Actions';
import { DeleteForm } from '../Plugins/PopupParts/DeleteForm';
import { ObjectForm } from '../Plugins/PopupParts/ObjectForm';
import { Predicates } from '../Plugins/PopupParts/Predicates';
import { NewMarking } from '../Plugins/PopupParts/NewMarking';
import { SelectSubject } from '../Plugins/PopupParts/SelectSubject';
import { Cancel } from '../Plugins/PopupParts/Cancel';
import { MarkingsStore } from '../Classes/MarkingsStore';
import { MarkingsEditor } from './MarkingsEditor';

const canceler = (event) => event.stopImmediatePropagation()

export class SelectionPopup extends (HTML.Span as typeof HTMLSpanElement) {

    public objectUri: ''
    public subject = ''
    public identifier = ''
    public predicate = ''
    public predicateType = ''
    public object = ''
    public name = ''
    public comment = ''
    public selections
    public markings
    public form
    public markingsStore: MarkingsStore
    public markingsEditor: MarkingsEditor

    public popupParts

    constructor () {
        super()
        this.addEventListener('mousedown', canceler)
        this.addEventListener('mouseup', canceler)
        this.addEventListener('click', canceler)
    }

    async upgradedCallback() {
        this.markings = this.selections.flatMap(words => words.flatMap(word => word.markings))
        document.body.classList.add('has-selection-popup')

        this.popupParts = [
            new Cancel(this),
            new Predicates(this),
            new Search(this), 
            new Actions(this), 
            new DeleteForm(this), 
            new ObjectForm(this),
            new NewMarking(this),
            new CreateMarking(this), 
            new SelectSubject(this)
        ]
        this.classList.add('selection-popup')
        this.draw()
    }

    async draw () {
        const popupPartsThatApply = this.popupParts.filter(popupPart => popupPart.applies())
        await render(this, html`${popupPartsThatApply.map(popupPart => popupPart.template())}`)
    }

    remove () {
        document.body.classList.remove('has-selection-popup')
        super.remove()
    }
}