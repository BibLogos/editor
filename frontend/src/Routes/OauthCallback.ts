import { Route } from '../types'

export const OauthCallback: Route = {
    name: 'oauth-callback',
    redirect: () => {
        const search = new URLSearchParams(location.search)
        const code = search.get('code')
        localStorage.githubCode = code
        return '/editor'
    }
}