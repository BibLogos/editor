export default {
    'api.bible': async (request, ctx, env, ...pathParts) => {
        const parsedURL = new URL(request.url)
        const apiUrl = `https://api.scripture.api.bible/v1/${pathParts.join('/')}${parsedURL.search}`
        const cache = caches.default
        const proxyRequest = new Request(apiUrl, { headers: { 'api-key': env.API_BIBLE_KEY } })

        let response = await cache.match(proxyRequest)

        if (!response) {
            const originalResponse = await fetch(proxyRequest)
            response = new Response(originalResponse.body, { headers: originalResponse.headers })
            response.headers.set("Access-Control-Allow-Origin", request.headers.get('origin'))
            response.headers.set('Cache-Control', 'max-age=360000')
            ctx.waitUntil(cache.put(proxyRequest, response.clone()))
        }

        return response
    }   
}