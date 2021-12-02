import { Octokit } from 'octokit'
import { Project } from '../Classes/Project'
import { cache } from '../Decorators/cache'

class githubClass {

    #app

    constructor () {
        this.#app = new Octokit()
    }

    @cache()
    async getProjects () {
        const response = await this.#app.rest.search.repos({ q: 'biblogos-' })
        const repos = response.data.items
        return repos.map(repo => new Project(repo))
    }

}

export const github = new githubClass()