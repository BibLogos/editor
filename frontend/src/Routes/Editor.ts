import { html } from 'ube'
import { Route } from '../types'
import { github } from '../Services/Github'

export const Editor: Route = {

    load: async function () {
        const { organisation, repo } = this.params
        const project = await github.getProject(organisation, repo)

        console.log(await project.books)
    },

    template: function () {
        return html`Hi`
    }

}