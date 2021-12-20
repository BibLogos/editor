export const env = document.querySelector('#env-json').innerHTML.trim() !== '' ? JSON.parse(document.querySelector('#env-json').innerHTML) : {
    API: 'https://api.biblogos.info'
}