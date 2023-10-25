import { Octokit } from 'octokit'
import { api } from '../Helpers/api'

export let GitHub: Octokit = {} as unknown as Octokit

export const init = async () => {

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

    return new Octokit(settings)
}

init().then(instance => GitHub = instance)
