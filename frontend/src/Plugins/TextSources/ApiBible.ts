import { env } from '../../Core/Env'
import { cache } from '../../Decorators/cache'
import { uniqueObject } from '../../Helpers/uniqueObject'

export class ApiBibleClass {
    
    @cache()
    async getLanguages () {
        const bibles = await this.getBibles()
        return bibles
        .map(bible => bible.language)
        .filter(uniqueObject('id'))
        .sort((a, b) => a.name.localeCompare(b.name))
    }

    @cache()
    async getBibles () {
        try {
            const response = await fetch(`${env.API}/plugins/api.bible/bibles`)
            const { data } = await response.json()
            return data.sort((a, b) => a.name.localeCompare(b.name))
        }
        catch (exception) {
            throw new Error('Could not fetch bibles from api.bible')
        }
    }

    @cache()
    async getBooks (bibleId: string) {
        try {
            const response = await fetch(`${env.API}/plugins/api.bible/bibles/${bibleId}/books`)
            const { data } = await response.json()
            return data
        }
        catch (exception) {
            throw new Error('Could not fetch books from api.bible')
        }
    }

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
    async getVerses (bibleId: string, bookId: string, chapterId: string) {
        try {
            const response = await fetch(`${env.API}/plugins/api.bible/bibles/${bibleId}/chapters/${`${bookId}.${chapterId}?content-type=json&include-verse-spans=true&include-notes=true`}`)
            const { data } = await response.json()
            return data
        }
        catch (exception) {
            throw new Error('Could not fetch verses from api.bible')
        }
    }
}

export const ApiBible = new ApiBibleClass()

// https://api.scripture.api.bible/v1
// plugins/api.bible/