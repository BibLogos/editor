import { config } from 'dotenv'
import fetch from 'node-fetch'

config()

fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE}/purge_cache`, {
  method: 'DELETE',
  headers: {
    'X-Auth-Email': process.env.CLOUDFLARE_EMAIL,
    'X-Auth-Key': process.env.CLOUDFLARE_KEY,
    'Content-Type': 'application/json',
  },
  body: '{"purge_everything":true}'
})