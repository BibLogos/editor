export const env = document.querySelector('#env-json').innerHTML ? JSON.parse(document.querySelector('#env-json').innerHTML) : {
    API: 'https://api.biblogos.info'
}