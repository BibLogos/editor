export default {
    'api.bible': async (request, ctx, env, ...pathParts) => {
        const parsedURL = new URL(request.url)
        const apiUrl = `https://api.scripture.api.bible/v1/${pathParts.join('/')}${parsedURL.search}`
        const proxyRequest = new Request(apiUrl, { headers: { 'api-key': env.API_BIBLE_KEY } })
        response = await fetch(proxyRequest)
        const proxyResponse = new Response(response.body, { headers: response.headers })
        proxyResponse.headers.set("Access-Control-Allow-Origin", request.headers.get('origin'))
        proxyResponse.headers.set('Cache-Control', 'max-age=360000')
        return proxyResponse
    }   
}