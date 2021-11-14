import { html } from 'ube'

export function selectMaker (title, objects: Array<{ id: string, name: string }>, property, values, labelField = 'name', idField = 'id') {
    return html`
    <div class="field">
        <label class="field-label">${title}</label>

        <div class="select">
            <select onchange=${async (event) => {
                const value = event.target.value
                await this[property](value)
                this.draw()
            }}>
                ${objects.map(object => html`<option ?selected=${values[property] === object[idField]} value=${object[idField]}>${object[labelField]}</option>`)}
            </select>

            <div class="focus"></div>
        </div>

    </div>
    `
}