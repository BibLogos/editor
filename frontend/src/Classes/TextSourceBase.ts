import { Project } from "./Project"
import { Store, Parser } from 'n3'
import { MarkingsStore } from "./MarkingsStore"

export class TextSourceBase {
    
    #project: Project
    settings
    #fileCache = new Map()
    #markingsStore: MarkingsStore

    constructor (project: Project, settings) {
        this.#project = project
        this.settings = settings
    }

    get name () {
        return this.settings.name
    }

    async getMarkingsStore () {
        if (this.#markingsStore) return this.#markingsStore

        const store = new Store()
        const parser = new Parser()
        const { slug, branch } = this.#project
        const sources: Array<string> = await Promise.all(this.settings.files.map(async fileMeta => {
            const url = `https://raw.githubusercontent.com/${slug}/${branch}/${fileMeta.file}`
            if (this.#fileCache.has(url)) return this.#fileCache.get(url)
            const response = await fetch(url)
            const text = await response.text()
            this.#fileCache.set(url, text)
            return text
        }))

        const allPrefixes = {}

        for (const source of sources) {
            await parser.parse(source, (error, quad, prefixes) => {
                if (error) console.error(error)
                if (quad) store.addQuad(quad)
                else Object.assign(allPrefixes, prefixes)
            })
        }

        this.#markingsStore = new MarkingsStore(store, this.settings.book)
        return this.#markingsStore
    }

}