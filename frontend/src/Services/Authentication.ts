export const Authentication = {
    isLoggedIn: function () {
        return !!localStorage.auth
    },
    login: async function (username: string, password: string) {
        const proxy = `http://localhost:8081/`
        const uri = `${proxy}http://localhost:3030/facts`
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
    }
    
}