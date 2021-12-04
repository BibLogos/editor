import { Octokit } from 'octokit'
import type { Octokit as OctokitType } from 'octokit'
import yaml from 'js-yaml'
import { Project } from '../Classes/Project'
import { cache } from '../Decorators/cache'
import { env } from '../Core/Env'

class githubClass {

    #app: OctokitType

    async init () {
        if (!this.#app) {
            const tokenResponse = await fetch(`${env.API}/token`)
            const auth = await tokenResponse.text()
            this.#app = new Octokit({ auth })    
        }
    }

    @cache()
    async getProjects (): Promise<Array<Project>> {
        await this.init()
        const response = await this.#app.rest.search.repos({ q: 'topic:biblogos' })
        const repos = response.data.items
        return await Promise.all(repos.map(repo => {
            const project = new Project()
            return project.init(repo)
        }))
    }

    @cache()
    async getProject (owner: string, repo: string) {
        await this.init()
        return (await this.getProjects())
        .find(project => project.slug === `${owner}/${repo}`)
    }

    async getBooks (owner: string, repo: string, branch: string) {
        await this.init()
        const response = await this.#app.rest.git.getTree({ owner, repo, tree_sha: branch })
        const files = response.data.tree
        const transformedFiles = await Promise.all(files
        .filter(file => file.path.endsWith('.biblogos'))
        .map(async file => {
            const meta = await github.#app.rest.git.getBlob({ owner, repo, file_sha: file.sha })
            return yaml.load(atob(meta.data.content))
        }))
        return transformedFiles
    }

}

export const github = new githubClass()