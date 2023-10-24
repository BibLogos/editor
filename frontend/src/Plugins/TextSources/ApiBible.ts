import { api } from '../../Helpers/api'

type Options = { bible: string, book: string }

export class ApiBible {

    public options: Options

    constructor (options: Options) {
        this.options = options
    }

    async getChapters () {
        const { bible, book } = this.options

        try {
            const response = await fetch(`${api}/plugins/api.bible/bibles/${bible}/books/${book}/chapters`)
            const { data } = await response.json()

            return data
            .filter(({ number }: { number: number | string }) => number !== 'intro')
            .map(({ number }: { number: number | string }) => {
                const label = number === 'intro' ? 'Intro' : number
                return [parseInt(number.toString()), label]
            })
        }
        catch (exception) {
            throw new Error('Could not fetch chapters from api.bible')
        }
    }

    async getText(chapter: string): Promise<Array<[paragraphId: string | number, text: string, prefix?: any, newlines?: number]>> {
        const { bible, book } = this.options

        try {
            const response = await fetch(`${api}/plugins/api.bible/bibles/${bible}/chapters/${`${book}.${chapter}?content-type=text`}`)
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
                return [verse, text, newlinesMatches?.length ?? 0]
            })
        }
        catch (exception) {
            console.error(exception)
            throw new Error('Could not fetch verses from api.bible')
        }
    }

}
