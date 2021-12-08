import { html } from 'ube'
import { PopupPartInterface } from "../../types";
import { PopupPartbase } from '../../Classes/PopupPartBase';

export class Search extends PopupPartbase implements PopupPartInterface {
    applies () {
        return false
    }

    template () {
        return html`<span>Search</span>`    
    }
}