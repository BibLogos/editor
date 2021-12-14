import { SelectionPopup } from "../Elements/SelectionPopup"

export class PopupPartbase {
    
    public selectionPopup: SelectionPopup
    
    constructor (selectionPopup) {
        this.selectionPopup = selectionPopup
    }

    toString () {
        return this.constructor.name
    }

}