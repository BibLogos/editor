import { env } from '../Core/Env'
import { importGlobalScript } from '../Helpers/importGlobalScript'
import { ComunicaExport } from '../types'
import { cache } from '../Decorators/cache'

const { newEngine } = await importGlobalScript('http://rdf.js.org/comunica-browser/versions/1/packages/actor-init-sparql/comunica-browser.js', 'Comunica') as ComunicaExport
const comunica = newEngine()

class DatabaseClass {
    async query (query) {
        const response = await comunica.query(query, {
            sources: [
                `${location.protocol}//${location.hostname}:${location.port}/ttl/BibLogos.ttl`,
                { type: 'sparql', value: `${env.PROXY}/${env.JENA}/facts` }
            ]
        })

        const bindings = await response.bindings()

        const result = []
        for (const binding of bindings) {
            let item = {}

            for (const variable of response.variables) {
                if (response.variables.length === 1) item = binding.get(variable)?.value
                else item[variable.substr(1)] = binding.get(variable)?.value
            }

            result.push(item)
        }

        return result
    }
    
    @cache()
    async getFactPredicates () {
        return this.query(`
            PREFIX biblogos: <https://biblogos/>

            SELECT * { 
                ?predicate rdfs:label ?label ;
                biblogos:predicateType ?type .
                OPTIONAL { ?predicate biblogos:predicateForm ?form }
                { ?predicate a rdfs:Class } UNION { ?predicate a rdfs:Property } .
            }
        `)
    }

    @cache()
    async searchSubject (searchTerm) {
        return this.query(`
        PREFIX biblogos: <https://biblogos/>

        SELECT * { 
            ?predicate rdfs:label ?label ;
            biblogos:predicateType ?type .
            OPTIONAL { ?predicate biblogos:predicateForm ?form }
            { ?predicate a rdfs:Class } UNION { ?predicate a rdfs:Property } .
        }
    `)
    }
}

export const Database = new DatabaseClass()
