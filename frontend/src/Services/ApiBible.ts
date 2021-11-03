import { env } from '../Core/Env'

export const ApiBible = {
    async getBibles () {
        try {
            const response = await fetch(`${env.PROXY}/https://api.scripture.api.bible/v1/bibles`)
            const { data } = await response.json()
            return data    
        }
        catch (exception) {
            throw new Error('Could not fetch bibles from api.bible')
        }
    }
}