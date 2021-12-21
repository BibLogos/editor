export default {
    'api.bible': async (request, ctx, env, ...pathParts) => {
        const parsedURL = new URL(request.url)
        const apiUrl = `https://api.scripture.api.bible/v1/${pathParts.join('/')}${parsedURL.search}`
        const proxyRequest = new Request(apiUrl, { headers: { 'api-key': env.API_BIBLE_KEY } })
        response = await fetch(proxyRequest)
        response.headers.set("Access-Control-Allow-Origin", request.headers.get('origin'))
        response.headers.set('Cache-Control', 'max-age=360000')

        return response
    }   
}