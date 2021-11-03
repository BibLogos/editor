import { html } from 'ube'

export function selectMaker (objects: Array<{ id: string, name: string }>, property, values, labelField = 'name', idField = 'id') {
    return html`
        <select onchange=${async (event) => {
            const value = event.target.value
            this.isWorking = true
            this.draw()
            await this[property](value)
            this.isWorking = false
            this.draw()
        }}>
            ${objects.map(object => html`<option ?selected=${values[property] === object[idField]} value=${object[idField]}>${object[labelField]}</option>`)}
        </select>
    `
}