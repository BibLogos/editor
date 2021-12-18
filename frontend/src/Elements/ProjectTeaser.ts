import { HTML, render, html } from 'ube';
import { Project } from '../Classes/Project';
import { t } from '../Helpers/t';

export class ProjectTeaser extends (HTML.Div as typeof HTMLElement) {

    private project: Project

    async upgradedCallback() {
        this.draw()
        console.log(this.project)
    }

    draw () {
        render(this, html`
        <div class="project teaser">
            <img src=${this.project.avatar} class="left avatar">

            <div class="right">
                <h3 class="title">${this.project.name}<em>, by ${this.project.owner}</em></h3>
                <p class="description">${this.project.description}</p>
            </div>

            <a class="button primary" href=${this.project.editorLink}>${t`View`}</a>
        </div>
        `)
    }
}
 