import ApiBible from './plugins/ApiBible.mjs'

const plugins = Object.assign({}, ApiBible)

export default {
  async fetch(request, env, ctx) {

    if (!['http://localhost:8080', 'https://biblogos.info'].includes(request.headers.get('origin'))) {
      return new Response('Acces denied', {
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
  
    const client_id = await env.CLIENT_ID
    const client_secret = await env.CLIENT_SECRET

    if (request.method === "GET") {
      const parsedURL = new URL(request.url)

      if (parsedURL.pathname.startsWith('/plugins/')) {
        const [ , , pluginName, ...pluginArguments] = parsedURL.pathname.split('/')
        if (pluginName in plugins) { return plugins[pluginName](request, ctx, env, ...pluginArguments) }
      }

      if (parsedURL.pathname === '/token') {
        return new Response(JSON.stringify({ token: env.GITHUB_TOKEN }), { status: 200, headers: {
          "Access-Control-Allow-Origin": "*",
          "content-type": "application/json",
        }})
      }

      if (parsedURL.pathname === '/login') {
        // redirect GET requests to the OAuth login page on github.com
        return Response.redirect(`https://github.com/login/oauth/authorize?client_id=${client_id}`, 302)
      }

      return new Response('Not found', { status: 404 })
    }
  
    try {
      const { code } = await request.json();
  
      const response = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "user-agent": "cloudflare-worker-github-oauth-login-demo",
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