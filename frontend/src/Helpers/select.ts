import { html } from 'ube'

export function select ({
    title, 
    values, 
    onchange,
    currentValue
}) {
    return html`
    <div class="field">
        <label class="field-label">${title}</label>

        <div class="select">
            <select onchange=${onchange}>
                ${values.map(([value, label]) => html`<option ?selected=${value === currentValue ? true : null} value=${value}>${label}</option>`)}
            </select>

            <div class="focus"></div>
        </div>

    </div>
    `
}