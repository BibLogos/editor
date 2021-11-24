import { env } from '../Core/Env'
import { importGlobalScript } from '../Helpers/importGlobalScript'
import { ComunicaExport, FactObject } from '../types'

const { newEngine } = await importGlobalScript('http://rdf.js.org/comunica-browser/versions/latest/packages/actor-init-sparql/comunica-browser.js', 'Comunica') as ComunicaExport
const comunica = newEngine()

const ONTOLOGY = `${location.protocol}//${location.hostname}:${location.port}/ttl/ontology.ttl`
const JENA = `${env.PROXY}/${env.JENA}/facts`
const DATABASE = { type: 'sparql', value: JENA }

class DatabaseClass {

    async query (query, sources: any) {
        comunica.invalidateHttpCache()
        const response = await comunica.query(query, { sources })
        if (response.type === 'boolean') return response.booleanResult
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
    
    async getFactPredicates () {
        return this.query(`
        PREFIX biblogos: <https://biblogos.info/ttl/ontology#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

        SELECT * { 
            { ?predicate a rdfs:Class } UNION { ?predicate a rdfs:Property } .
            ?predicate rdfs:label ?label .
            ?predicate biblogos:predicateType ?type .
        }
        `, [ ONTOLOGY ])
    }

    async searchSubject (searchTerm, predicate) {
        return this.query(`
        PREFIX biblogos: <https://biblogos.info/ttl/ontology#>

        SELECT * { 
            ?predicate a <${predicate}> .
            ?predicate biblogos:name ?name .
            ?predicate a/a rdfs:Class .
            OPTIONAL { ?predicate biblogos:comment ?comment . }
            FILTER regex(?name, """${searchTerm}""", "i")
        }
    `, [ DATABASE, ONTOLOGY ])
    }

    async insertFact (object: FactObject) {
        const query = `
        PREFIX biblogos: <https://biblogos.info/ttl/ontology#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

        DELETE { 
            <${object.uri}> a ?type .
            <${object.uri}> biblogos:name ?name .
            <${object.uri}> biblogos:subject ?subject .
            <${object.uri}> biblogos:reference ?reference .
            <${object.uri}> biblogos:comment ?comment . 
        } WHERE { 
            <${object.uri}> a ?type .
            <${object.uri}> biblogos:name ?name .
            <${object.uri}> biblogos:reference ?reference .
            OPTIONAL { <${object.uri}> biblogos:comment ?comment . }
            OPTIONAL { <${object.uri}> biblogos:subject ?subject . }
        };
        
        INSERT DATA { 
            <${object.uri}> a <${object.predicate}> .
            <${object.uri}> biblogos:name """${object.name}""" .
            <${object.uri}> biblogos:reference """${object.range}""" .
            ${object.subject ? `
                <${object.uri}> biblogos:subject <${object.subject}> .
            ` : ''}
            ${object.comment ? `
                <${object.uri}> biblogos:comment """${object.comment}""" .
            ` : ''}
        } 
        `

        try {
            const response = await fetch(JENA, {
                method: 'POST',
                body: query,
                headers: { 'content-type': 'application/sparql-update' }
            })    

            return response.status === 204
        }
        catch (exception) {
            console.error(exception)
        }
    }

    async appendFactReference (predicate: string, range: string) {
        const query = `
        PREFIX biblogos: <https://biblogos.info/ttl/ontology#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        
        INSERT DATA { <${predicate}> biblogos:reference """${range}""" . }`

        try {
            const response = await fetch(JENA, {
                method: 'POST',
                body: query,
                headers: { 'content-type': 'application/sparql-update' }
            })    

            return response.status === 204
        }
        catch (exception) {
            console.error(exception)
        }
    }

    async uriExists (uri) {
        return this.query(`ASK WHERE { <${uri.replaceAll(' ', '')}> ?p ?o }`, [ DATABASE ])
    }

    async getHighlights (bible, book, chapter) {
        return this.query(`
        PREFIX biblogos: <https://biblogos.info/ttl/ontology#>

        SELECT ?thing ?reference ?name (COALESCE(?class_predicate, ?property_predicate) as ?predicate) ?comment {
            ?thing biblogos:reference ?reference .
            OPTIONAL { ?thing biblogos:name ?name . }
            OPTIONAL { ?thing biblogos:comment ?comment . }
            OPTIONAL { ?thing a ?class_predicate . }
            OPTIONAL { ?thing biblogos:predicate ?property_predicate . }
            FILTER strstarts(?reference, """${`${book}.${chapter}"""`})
        }
    `, [ DATABASE ])
    }
    
}

export const Database = new DatabaseClass()
