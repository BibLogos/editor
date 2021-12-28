import { HTML, render, html } from 'ube';
import { params } from '../Core/Router';
import { github } from '../Services/Github'
import { select } from '../Helpers/select';
import { goTo } from '../Core/Router';
import { t } from '../Helpers/t';
import { Project } from '../Classes/Project';
import { app } from '../app';
import { icon } from '../Helpers/icon';

export class BookNavigation extends (HTML.Div as typeof HTMLElement) {

    private book
    private chapters
    private project: Project
    private bookOptions

    async upgradedCallback() {
        let { ownerId, repoId, bookId } = params
        this.project = await github.getProject(ownerId, repoId)
        this.book = this.project.books.find(book => book.name === bookId)

        this.bookOptions = this.project.books.map(book => [book.settings.name, book.settings.name])

        this.chapters = await this.book?.getChapters()
        this.classList.add('book-navigation')

        if (!this.book) {
            app.addEventListener('params-change', () => {
                this.upgradedCallback()
            }, { once: true })
            return
        }

        app.addEventListener('params-change', () => this.draw())

        this.draw()
    }

    draw () {
        if (!this.book) return
        render(this, html`

        <h2 class="project-title">${this.project.name}</h2>

        ${select({
            values: this.bookOptions, 
            onchange: (event) => {
                const pathParts = location.pathname.split('/')
                pathParts[4] = event.target.value
                goTo(pathParts.join('/'))
            },
            currentValue: params.bookId
        })}

        ${select({
            values: this.chapters, 
            onchange: (event) => {
                const pathParts = location.pathname.split('/')
                pathParts[5] = event.target.value
                goTo(pathParts.join('/'))
            },
            currentValue: params.chapterId
        })}
        
        `)
    }
}
 