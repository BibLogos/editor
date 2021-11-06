import { createServer as createCorsServer } from 'cors-anywhere'
import { config } from 'dotenv'
import express from 'express'
import http from 'http'
import apicache from 'apicache'
import expressHttpProxy from 'express-http-proxy'
import redis from 'redis'

config()

const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 8081
const internalPort = process.env.PORT || 8082

const cors_proxy = createCorsServer({
  originWhitelist: [],
  removeHeaders: ['cookie', 'cookie2']
})

http.createServer(function(req, res) {
  req.headers['api-key'] = process.env.API_BIBLE
  cors_proxy.emit('request', req, res)
}).listen(internalPort, host, function() {
  console.log('Running CORS Anywhere on ' + host + ':' + internalPort)
})

const app = express()
app.get('/*', cacheMiddleware())
app.options('/*', cacheMiddleware())
app.use(expressHttpProxy(`localhost:${internalPort}`))

app.listen(port, () => {
  console.log(`External CORS cache server started at port ${port}`);
})

function cacheMiddleware() {
  return apicache.options({
    redisClient: redis.createClient({
      auth_pass: process.env.REDIS_PASSWORD
    }),
    statusCodes: { include: [200] },
    defaultDuration: 60000,
    appendKey: (req, res) => req.method
  }).middleware()
}