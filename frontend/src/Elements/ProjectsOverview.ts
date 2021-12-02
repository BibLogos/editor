import { HTML, render, html } from 'ube';

export class ProjectsOverview extends HTML.Div {

    async upgradedCallback() {
        this.draw()
    }

    draw () {
        render(this, html`
            projects
        `)
    }
}
 