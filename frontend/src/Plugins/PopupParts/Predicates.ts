import { html } from 'ube'
import { PopupPartInterface } from "../../types";
import { PopupPartbase } from '../../Classes/PopupPartBase';
import { select } from '../../Helpers/select';
import { t } from '../../Helpers/t';

export class Predicates extends PopupPartbase implements PopupPartInterface {

    private factPredicates

    applies () {
        return this.selectionPopup.form === 'search'
    }

    template () {
        if (!this.factPredicates) {
            this.selectionPopup.markingsStore.getFactPredicates().then(factPredicates => {
                this.factPredicates = factPredicates
                this.selectionPopup.draw()
            })
        }

        return this.factPredicates ? select({
            title: t`Relation type`,
            values: [
                ['', '- Select -'],
                ...this.factPredicates.map(factPredicate => [factPredicate.predicate + '|' + factPredicate.type, factPredicate.label])
            ].filter(([value]) => !this.selectionPopup.markings.find(marking => marking.predicate === value)), 
            onchange: (event) => {
                const [predicate, type] = event.target.value.split('|')
                this.selectionPopup.predicate = predicate
                this.selectionPopup.predicateType = type
                this.selectionPopup.draw()
            }
        }) : html`
            <span>${t`Loading...`}</span>
        `
    }
}