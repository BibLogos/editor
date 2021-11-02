export default {
  mount: {
    'frontend/src': '/',
    'frontend/html': '/',
    "frontend/scss": "/",
  },
  plugins: [
    '@snowpack/plugin-sass'
  ],
  packageOptions: {
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
  routes: [
    {
      match: 'routes',
      src: '.*',
      dest: '/index.html',
    },
  ],
  optimize: {
    bundle: true,
    minify: true,
    target: 'es2018',
  },
};
