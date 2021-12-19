import dotenv from 'dotenv'
import fs from 'fs'

let env = {}
if (fs.existsSync('.env')) {
  const data = fs.readFileSync('.env', 'utf8')
  const buf = Buffer.from(data)
  const allEnv = dotenv.parse(buf)
  for (const [key, value] of Object.entries(allEnv)) {
    if (key.startsWith('FRONTEND_')) env[key.substr(9)] = value
  }
}

export default {
  mount: {
    'frontend/src': '/',
    'frontend/html': '/',
    "frontend/scss": "/",
    "frontend/assets": "/assets",
    "ttl": "/ttl",
  },
  plugins: [
    '@snowpack/plugin-sass'
  ],
  routes: [
    { 
      "match": "routes", 
      "src": ".*", 
      dest: (req, res) => {
        let indexText = fs.readFileSync('frontend/html/index.html', 'utf8')
        indexText = indexText.replace('<script type="application/json" id="env-json"></script>', 
        `<script type="application/json" id="env-json">${JSON.stringify(env)}</script>`)
        res.writeHead(200)
        res.end(indexText)
      },
    },
  ],
  optimize: {
    bundle: true,
    minify: true,
    target: 'es2018',
  }
};
