import { env } from '../../Core/Env'
import { cache } from '../../Decorators/cache'
import { TextSource } from '../../Classes/TextSource'
import { TextSourceBase } from '../../Classes/TextSourceBase'
import { html } from 'ube'

export class ApiBible extends TextSourceBase implements TextSource {

    @cache()
    async getChapters () {
        const { bible, book } = this.settings

        try {
            const response = await fetch(`${env.API}/plugins/api.bible/bibles/${bible}/books/${book}/chapters`)
            const { data } = await response.json()

            return data.map(({ number }) => {
                const label = number === 'intro' ? 'Introduction' : number
                return [number, label]
            })
        }
        catch (exception) {
            throw new Error('Could not fetch chapters from api.bible')
        }
    }

    @cache()
    async getText(chapter: string): Promise<Array<[paragraphId: string | number, text: string, prefix?: any, newlines?: number]>> {
        const { bible, book } = this.settings

        try {
            const response = await fetch(`${env.API}/plugins/api.bible/bibles/${bible}/chapters/${`${book}.${chapter}?content-type=text`}`)
            const { data } = await response.json()
            const regex = /\[(\d+)\]([^[]*)/g
            const matches = [...data.content.matchAll(regex)]

            // Introductions dont have verses.
            if (matches.length === 0) return [[1, data.content]]

            return matches
            .map(match => {
                const newlinesMatches = /\r|\n/.exec(match[2])
                
                const verse = parseInt(match[1])
                const text = match[2].trim() 
                const prefix = (markings) => html`<span class="verse-number word">${verse}${markings} </span>`
                return [verse, text, prefix, newlinesMatches?.length ?? 0]
            })
        }
        catch (exception) {
            console.error(exception)
            throw new Error('Could not fetch verses from api.bible')
        }
    }

}
