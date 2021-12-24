import { HTML, render, html } from 'ube';
import { github } from '../Services/Github';
import { Project } from '../Classes/Project';
import { ProjectTeaser } from './ProjectTeaser';
import { t } from '../Helpers/t';

export class ProjectsOverview extends (HTML.Div as typeof HTMLElement) {

    private projects: Array<Project> = []

    async upgradedCallback() {
        this.draw()
        this.classList.add('projects-overview')
        this.classList.add('route')
        this.projects = await github.getProjects()
        this.draw()
    }

    draw () {
        render(this, html`
        ${!this.projects ? html`Loading...` : html`
            ${this.projects.map(project => html`<${ProjectTeaser} .project=${project} />`)}
        `}
        `)
    }
}
 