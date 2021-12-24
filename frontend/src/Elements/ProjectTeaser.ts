import { HTML, render, html } from 'ube';
import { Project } from '../Classes/Project';
import { t } from '../Helpers/t';

export class ProjectTeaser extends (HTML.Div as typeof HTMLElement) {

    private project: Project

    async upgradedCallback() {
        this.draw()
        this.classList.add('project')
        this.classList.add('teaser')
    }

    draw () {
        render(this, html`
        <h3 class="title">${this.project.name}<em>, by ${this.project.owner}</em></h3>
        <p class="description">${this.project.description}</p>

        <div class="actions">
            <a class="button medium secondary edit" href=${this.project.editorLink}>${t`Edit facts`}</a>
            <a class="button medium primary" href=${this.project.editorLink}>${t`Explore data`}</a>
        </div>
        
        `)
    }
}
 