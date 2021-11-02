import { createServer } from 'cors-anywhere'
import http from 'http'

const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 8081

const cors_proxy = createServer({
    originWhitelist: [],
    removeHeaders: ['cookie', 'cookie2']
  })
  
  http.createServer(function(req, res) {
    cors_proxy.emit('request', req, res)
  }).listen(port, host, function() {
    console.log('Running CORS Anywhere on ' + host + ':' + port)
  });
  