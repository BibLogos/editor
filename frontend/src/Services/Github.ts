import { Octokit } from 'octokit'
import type { Octokit as OctokitType } from 'octokit'
import yaml from 'js-yaml'
import { ProjectData } from '../types'
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

    // @cache()
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
        const { data: repoData } = await this.#app.rest.repos.get({ owner, repo })
        const project = new Project()
        return project.init((repoData as unknown as ProjectData))

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
            return false
        }
    }
    
    async getForkRepo (originalOwner: string, forkOwner: string, repo: string) {
        const { data: repos } = await this.#app.rest.repos.listForks({ owner: originalOwner, repo })
        const forkOfCurrentUser = repos.find(repo => repo.owner.login === forkOwner)
        return forkOfCurrentUser
    }

    async createForkRepo (originalOwner: string, repo: string) {
        return await this.#app.rest.repos.createFork({ owner: originalOwner, repo })
    }

    async getCurrentUser () {
        if (!localStorage.githubToken) return null

        try {
            const { data } = await this.#app.rest.users.getAuthenticated()
            return data
        }
        catch (exception) {
            return null
        }
    }

    async getLatestCommit (org: string, repo: string, branch: string = 'main') {
        // TODO get default branch name if no branch is given.
        const { data } = await this.#app.rest.git.getRef({
            owner: org,
            repo,
            ref: `heads/${branch}`,
        })
        return data.object.sha
    }

    async createBranchOnFork (org: string, originalOwner: string, repo: string, branch: string) {
        const lastestCommit = await this.getLatestCommit(originalOwner, repo)

        return await this.#app.rest.git.createRef({
            owner: org,
            repo,
            ref: `refs/heads/${branch}`,
            sha: lastestCommit
        })
    }

    async createMergeRequest (org: string, originalOwner: string, repo: string, branch: string, sha: string) {
        return this.#app.rest.pulls.create({
            owner: originalOwner,
            repo,
            title: 'Created via biblogos.info, please review',
            body: 'Created via biblogos.info, please review',
            head: `${org}:${branch}`,
            base: 'main',
        })
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

        return await this.#app.rest.git.updateRef({
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