import yaml from 'js-yaml'
import { Book } from '../../types'
import { textSources } from '../Plugins/TextSources/textSources'
import { GitHub } from '../Services/GitHub'
import { Parser, Store } from 'n3'
import { GrapoiPointer } from '../../types'
import Grapoi from 'grapoi'

export class Project {

    public data: any

    constructor (
        public owner: string, 
        public repo: string
    ) {}

    async fetch () {
        const { owner, repo } = this
        const { data: data } = await GitHub.rest.repos.get({ owner, repo })
        this.data = data

        const response = await GitHub.rest.git.getTree({ 
            owner, repo, tree_sha: data.default_branch 
        })

        const bookMetas: Array<Book<object>> = await Promise.all(response.data.tree
            .filter(file => file?.path?.endsWith('.biblogos'))
            .map(async file => {
                const meta = await GitHub.rest.git.getBlob({ 
                    owner, repo, file_sha: file.sha! 
                })
                return yaml.load(atob(meta.data.content)) as Book<object>
            }))

        return bookMetas.map(bookMeta => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            /** @ts-ignore */
            return new textSources[bookMeta.type](bookMeta)
        })
    }

    async getPointer (filename: string) {
        const { owner, repo } = this
        const url = `https://raw.githubusercontent.com/${owner}/${repo}/${this.data.default_branch}/${filename}?${(new Date()).getTime()}`
        const turtle = await fetch(url).then(response => response.text())
        const parser = new Parser()
        const quads = await parser.parse(turtle)
        const dataset = new Store(quads)
        const pointer: GrapoiPointer = new Grapoi({ dataset })
        return pointer
    }
}