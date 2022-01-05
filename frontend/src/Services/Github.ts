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
            const settings: { auth?: string } = { }

            if (localStorage.githubCode) {
                const tokenResponse = await fetch(`${env.API}/token`, {
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

            this.#app = new Octokit(settings)
        }
    }

    get git () {
        return this.#app.rest.git
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

    async isLoggedIn () {
        if (!localStorage.githubToken) return false

        try {
            await this.#app.rest.users.getAuthenticated()
            return true   
        }
        catch (exception) {
            console.log(exception)
            return false
        }
    }
    
    async getLatestCommit (org: string, repo: string, branch: string = 'main') {
        const { data } = await this.#app.rest.git.getRef({
            owner: org,
            repo,
            ref: `heads/${branch}`,
        })
        return data.object.sha
    }

    async createCommit (org: string, repo: string, branch: string = 'main', files: Array<{file: string, content: string}>) {
        const { data: refData } = await this.#app.rest.git.getRef({
            owner: org,
            repo,
            ref: `heads/${branch}`,
        })

        const commitSha = refData.object.sha
        const { data: commitData } = await this.#app.rest.git.getCommit({
            owner: org,
            repo,
            commit_sha: commitSha,
        })

        const treeItems = []

        for (const { file, content } of files) {
            const gitBlob = await this.createBlobForFile(org, repo, content)
            treeItems.push({
                path: file,
                sha: gitBlob.sha,
                mode: "100644",
                type: "blob"
            });
        }

        const tree = await this.#app.rest.git.createTree({
            owner: org,
            repo,
            tree: treeItems,
            base_tree: commitData.tree.sha,
        })

        let commit = await this.#app.rest.git.createCommit({
            owner: org,
            repo,
            message: `Updates on ${files.map(item => item.file).join(', ')}`,
            tree: tree.data.sha,
            parents: [commitSha]
        })

        await this.#app.rest.git.updateRef({
            owner: org,
            repo,
            ref: `heads/${branch}`,
            sha: commit.data.sha,
        })

    }

    async createBlobForFile (org: string, repo: string, content: string) {
        const blobData = await this.#app.rest.git.createBlob({
          owner: org,
          repo,
          content,
          encoding: 'utf-8',
        })

        return blobData.data
      }
}

export const github = new githubClass()