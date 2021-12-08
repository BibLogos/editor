import { HTML, render, html } from 'ube';
import { params } from '../Core/Router';
import { github } from '../Services/Github'
import { select } from '../Helpers/select';
import { goTo } from '../Core/Router';
import { t } from '../Helpers/t';

const HTMLDiv = HTML.Div as typeof HTMLElement

export class BookNavigation extends HTMLDiv {

    private book
    private chapters

    async upgradedCallback() {
        let { ownerId, repoId, bookId } = params
        const project = await github.getProject(ownerId, repoId)
        this.book = project.books.find(book => book.name === bookId)
        this.chapters = await this.book.getChapters()
        this.classList.add('book-navigation')
        this.draw()
    }

    draw () {
        render(this, select({
            title: t`Chapter`,
            values: this.chapters, 
            onchange: (event) => {
                const pathParts = location.pathname.split('/')
                pathParts[5] = event.target.value
                goTo(pathParts.join('/'))
            },
            currentValue: params.chapterId
        }))
    }
}
 