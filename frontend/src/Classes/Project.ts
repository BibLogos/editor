import { ProjectData } from '../types'

export class Project {

    readonly #data: ProjectData

    constructor (data: ProjectData) {
        this.#data = data
    }

    get name () {
        return this.#data.name
        .replace('biblogos-', '')
        .replaceAll('-', ' ')
    }

    get slug () {
        return this.#data.full_name
    }
}