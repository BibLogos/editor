import { Project } from "./Project"
import { Store, Parser } from 'n3'
import { MarkingsStore } from "./MarkingsStore"

export class TextSourceBase {
    
    #project: Project
    settings

    constructor (project: Project, settings) {
        this.#project = project
        this.settings = settings
    }

    get name () {
        return this.settings.name
    }

    async getMarkingsStore () {
        const store = new Store()
        const parser = new Parser()
        const { slug, branch } = this.#project
        const sources: Array<string> = await Promise.all(this.settings.files.map(async fileMeta => {
            const response = await fetch(`https://raw.githubusercontent.com/${slug}/${branch}/${fileMeta.file}`)
            return await response.text()
        }))

        const allPrefixes = {}

        for (const source of sources) {
            await parser.parse(source, (error, quad, prefixes) => {
                if (error) console.error(error)
                if (quad) store.addQuad(quad)
                else Object.assign(allPrefixes, prefixes)
            })
        }

        return new MarkingsStore(store, this.settings.book)
    }

}