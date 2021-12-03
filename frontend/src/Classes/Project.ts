import { ProjectData } from '../types'
import { github } from '../Services/Github'

import { ApiBible } from '../Plugins/TextSources/ApiBible'

const plugins = {
    ApiBible
}

export class Project {

    #data: ProjectData
    books

    async init (data: ProjectData) {
        this.#data = data
        const books = await github.getBooks(this.#data.owner.login, this.#data.name, this.#data.default_branch)
        this.books = books.map(book => new plugins[book.type](this, book))
        return this
    }

    get name () {
        return this.#data.name
        .replace('biblogos-', '')
        .replaceAll('-', ' ')
    }

    get slug () {
        return this.#data.full_name
    }

    get branch () {
        return this.#data.default_branch
    }
}