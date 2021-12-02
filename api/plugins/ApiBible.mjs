export default {
    'api.bible': async (request, env, ...pathParts) => {
        const proxyRequest = new Request(`https://api.scripture.api.bible/v1/${pathParts.join('/')}`, {
            headers: { 'api-key': env.API_BIBLE_KEY }
        })

        const response = await fetch(proxyRequest)
        response.headers.set("Access-Control-Allow-Origin", request.headers.get('origin'))
        return response
    }   
}