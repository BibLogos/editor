import { ProjectData } from '../types'
import { github } from '../Services/Github'

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

    get books () {
        return (async () => {
            const books = await github.getBooks(this.#data.owner.login, this.#data.name, this.#data.default_branch)

            console.log(books)
        })()
    }
}