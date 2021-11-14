import { env } from '../Core/Env'

export const Authentication = {
    
    isLoggedIn: function () {
        return !!localStorage.auth
    },

    login: async function (username: string, password: string) {
        const { JENA, PROXY } = env
        const uri = `${PROXY}/${JENA}`
        let validCredentials = false
        try {
            const response = await fetch(uri, {
                headers: { 'Authorization': `Basic ${btoa(`${username}:${password}`)}` }
            })

            validCredentials = response.status === 200
        }
        catch {}
        localStorage.auth = validCredentials ? `${username}:${password}` : false
        return validCredentials
    },

    get auth () {
        return localStorage.auth
    }
    
}