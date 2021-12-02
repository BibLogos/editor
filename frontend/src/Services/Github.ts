import { Octokit } from 'octokit'
import type { Octokit as OctokitType } from 'octokit'

import { Project } from '../Classes/Project'
import { cache } from '../Decorators/cache'

class githubClass {

    #app: OctokitType

    constructor () {
        this.#app = new Octokit()
    }

    @cache()
    async getProjects (): Promise<Array<Project>> {
        const response = await this.#app.rest.search.repos({ q: 'biblogos-' })
        const repos = response.data.items
        return repos.map(repo => new Project(repo))
    }

    @cache()
    async getProject (owner: string, repo: string) {
        const projects = await this.getProjects()
        return projects.find(project => project.slug === `${owner}/${repo}`)
    }

    async getBooks (owner: string, repo: string, branch: string) {
        const response = await this.#app.rest.git.getTree({
            owner,
            repo,
            tree_sha: branch
        })

        const files = response.data.tree
        const bookFiles = await Promise.all(files
        .filter(file => file.path.endsWith('.biblogos'))
        .map(async file => {
            const fileMeta = await github.#app.rest.git.getBlob({
                owner,
                repo,
                file_sha: file.sha
            })
            
            const contents = atob(fileMeta.data.content)
            return contents
        }))

        console.log(bookFiles)
    }

}

export const github = new githubClass()