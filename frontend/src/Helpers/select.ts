import { html } from 'ube'
import { groupBy } from 'lodash-es'

export function select ({
    title, 
    values, 
    onchange,
    currentValue = '',
    extraCssClass = ''
}: {
    title?: string, 
    values: Array<[string, string]>, 
    onchange: Function,
    currentValue?: string,
    extraCssClass?: string
}) {

    const groupedValues = groupBy(values, (item) => item[2]?.split(/#|\//g).pop() ?? 'Ungrouped')

    const list = (values) => {
        return values.map(([value, label]) => 
            html`<option 
                ?disabled=${value === ''} 
                .selected=${value.toString() === currentValue.toString() ? true : null} 
                value=${value}
            >
                ${label}
            </option>`)

    }

    return html`
    <div class="field">
        ${title ? html`<label class="field-label">${title}</label>` : null}

        <div class=${`select ${extraCssClass}`}>
            <select onchange=${onchange}>

                ${Object.keys(groupedValues).length > 1 ? html`
                    ${Object.entries(groupedValues).map(([name, values]) => {
                        return html`
                        <optgroup label="${name}">
                            ${list(values)}
                        </optgroup>    
                        `
                    })}
                ` : list(values)} 

            </select>

            <div class="focus"></div>
        </div>

    </div>
    `
}