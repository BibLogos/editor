import { html } from 'ube'

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
    return html`
    <div class="field">
        ${title ? html`<label class="field-label">${title}</label>` : null}

        <div class=${`select ${extraCssClass}`}>
            <select onchange=${onchange}>
                ${values.map(([value, label]) => html`<option ?disabled=${value === ''} ?selected=${value.toString() === currentValue.toString() ? true : null} value=${value}>${label}</option>`)}
            </select>

            <div class="focus"></div>
        </div>

    </div>
    `
}