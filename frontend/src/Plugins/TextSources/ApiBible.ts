import { env } from '../../Core/Env'
import { cache } from '../../Decorators/cache'
import { TextSource } from '../../Classes/TextSource'
import { TextSourceBase } from '../../Classes/TextSourceBase'
import { html } from 'ube'

export class ApiBible extends TextSourceBase implements TextSource {

    @cache()
    async getChapters (bibleId: string, bookId: string) {
        try {
            const response = await fetch(`${env.API}/plugins/api.bible/bibles/${bibleId}/books/${bookId}/chapters`)
            const { data } = await response.json()
            return data
        }
        catch (exception) {
            throw new Error('Could not fetch chapters from api.bible')
        }
    }

    @cache()
    async getText(chapter: string): Promise<Array<[paragraphId: string | number, text: string, prefix?: any]>> {
        const { bible, book } = this.settings

        try {
            const response = await fetch(`${env.API}/plugins/api.bible/bibles/${bible}/chapters/${`${book}.${chapter}?content-type=text`}`)
            const { data } = await response.json()

            const regex = /\[(\d+)\]([^[]*)/g
            return [...data.content.matchAll(regex)]
            .map(match => {
                const verse = parseInt(match[1])
                const text = match[2].trim() 
                const prefix = html`<span class="ignore">${verse} </span>`
                return [verse, text, prefix]
            })
        }
        catch (exception) {
            throw new Error('Could not fetch verses from api.bible')
        }
    }

}
