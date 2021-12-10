import { HTML, render, html } from 'ube';
import { github } from '../Services/Github';
import { Project } from '../Classes/Project';

export class ProjectsOverview extends (HTML.Div as typeof HTMLElement) {

    private projects: Array<Project> = []

    async upgradedCallback() {
        this.draw()
        this.projects = await github.getProjects()
        this.draw()
    }

    draw () {
        render(this, html`
        ${!this.projects ? html`Loading...` : html`
        <ul>
        ${this.projects.map(project => html`
            <li>
            <a href=${`/editor/${project.slug}`}>${project.name}</a>
            </li>
        `)}
        </ul>
        `}
        `)
    }
}
 