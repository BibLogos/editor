import { Octokit } from 'octokit'
import type { Octokit as OctokitType } from 'octokit'
import yaml from 'js-yaml'
import { api } from '../Helpers/api'
import { ApiBible } from '../Plugins/TextSources/ApiBible'

const plugins = {
    ApiBible
}

class ProjectsClass {

    #github: OctokitType = null as unknown as OctokitType

    constructor () {
        /** @ts-ignore */
        return this.init().then(() => this)
    }

    async init () {
        if (this.#github) return

        const settings: { auth?: string } = { }

        if (localStorage.githubCode) {
            const tokenResponse = await fetch(`${api}/token`, {
                method: 'POST',
                body: localStorage.githubCode
            })
            const { token } = await tokenResponse.json()    
            localStorage.githubToken = token
            delete localStorage.githubCode
        }

        if (localStorage.githubToken) {
            settings.auth = localStorage.githubToken
        }

        this.#github = new Octokit(settings)
    }

    get git () {
        return this.#github.rest.git
    }

    // async getProjects (): Promise<Array<any>> {
    //     await this.init()
    //     const response = await this.#app.rest.search.repos({ q: 'topic:biblogos' })
    //     const repos = response.data.items

    //     return await Promise.all(repos.map(repo => {
    //         const project = new Project()
    //         return project.init(repo)
    //     }))
    // }

    async getProject (owner: string, repo: string) {
        await this.init()
        const { data: repoData } = await this.#github.rest.repos.get({ owner, repo })
        const books = await this.getBooks(repoData.owner.login, repoData.name, repoData.default_branch)
        return {
            repo, books
        }
    }

    async getBooks (owner: string, repo: string, branch: string) {
        await this.init()
        const response = await this.#github.rest.git.getTree({ owner, repo, tree_sha: branch })
        const files = response.data.tree
        const transformedFiles = await Promise.all(files
        .filter(file => file?.path?.endsWith('.biblogos'))
        .map(async file => {
            if (!file.sha) return
            const meta = await this.#github.rest.git.getBlob({ owner, repo, file_sha: file.sha })
            return yaml.load(atob(meta.data.content))
        }))

        return transformedFiles.map((book: any) => new plugins[book.type as keyof typeof plugins](book))
    }

    async isLoggedIn () {
        if (!localStorage.githubToken) return false

        try {
            await this.#github.rest.users.getAuthenticated()
            return true   
        }
        catch (exception) {
            return false
        }
    }
    
    async getCurrentUser () {
        if (!localStorage.githubToken) return null

        try {
            const { data } = await this.#github.rest.users.getAuthenticated()
            return data
        }
        catch (exception) {
            return null
        }
    }

}

export const projects = await new ProjectsClass()