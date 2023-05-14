import { defineConfig } from 'vite'
import DynamicPublicDirectory from './vite/vite-static'

export default defineConfig({
  root: 'frontend/src/',
  resolve: {
    alias: {
      'node-fetch': 'isomorphic-fetch',
    },
  },
  plugins: [
    DynamicPublicDirectory({
      'frontend/html': '/',
      "frontend/scss": "/",
      "frontend/favicon": "/",
      "frontend/markdown": "/markdown",
      "frontend/assets": "/assets",
      "ttl": "/ttl",
    }),
  ],
  define: {
    global: {},
  },
})