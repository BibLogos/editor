import ApiBible from './plugins/ApiBible.mjs'

const plugins = Object.assign({}, ApiBible)

export default {
  async fetch(request, env, ctx) {
    const client_id = await env.CLIENT_ID
    const client_secret = await env.CLIENT_SECRET
    const parsedURL = new URL(request.url)

    if (request.method === "GET" && parsedURL.pathname === '/login') {
      const scopes = ['repo']
      // redirect GET requests to the OAuth login page on github.com
      return Response.redirect(`https://github.com/login/oauth/authorize?client_id=${client_id}&scope=${scopes.join(' ')}`, 302)
    }

    if (request.headers.get('origin') && !['http://localhost:5173', 'https://biblogos.info'].includes(request.headers.get('origin'))) {
      return new Response('Acces denied by CORS', {
        status: 401,
      });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method === "GET") {
      if (parsedURL.pathname.startsWith('/plugins/')) {
        const [ , , pluginName, ...pluginArguments] = parsedURL.pathname.split('/')
        if (pluginName in plugins) { return plugins[pluginName](request, ctx, env, ...pluginArguments) }
      }

      return new Response('Not found', { status: 404 })
    }
  
    if (request.method === "POST" && parsedURL.pathname === '/token') {
      try {
        const code = await request.text();

        const response = await fetch(
          "https://github.com/login/oauth/access_token",
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "user-agent": "cloudflare-worker-biblogos",
              accept: "application/json",
            },
            body: JSON.stringify({ client_id, client_secret, code }),
          }
        );
        const result = await response.json();
        const headers = {
          "Access-Control-Allow-Origin": "*",
        };
    
        if (result.error) {
          return new Response(JSON.stringify(result), { status: 401, headers });
        }
    
        return new Response(JSON.stringify({ token: result.access_token }), {
          status: 201,
          headers,
        });
      } catch (error) {
        console.error(error);
        return new Response(error.message, {
          status: 500,
        });
      }  
    }
  }
}