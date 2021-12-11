import { importGlobalScript } from '../Helpers/importGlobalScript'
import { ReferenceProxy } from './ReferenceProxy'
import { ComunicaExport, FactObject } from '../types'
const { newEngine } = await importGlobalScript('http://rdf.js.org/comunica-browser/versions/latest/packages/actor-init-sparql/comunica-browser.js', 'Comunica') as ComunicaExport

const ONTOLOGY = `${location.protocol}//${location.hostname}:${location.port}/ttl/ontology.ttl`

export class MarkingsStore {

    #store
    #comunica
    #bookAbbreviation

    constructor (store, bookAbbreviation) {
        this.#store = store
        this.#comunica = newEngine()
        this.#bookAbbreviation = bookAbbreviation
    }

    get bookAbbreviation () {
        return this.#bookAbbreviation
    }

    async query (query, sources: any, debug = false) {
        if (debug) console.log(query)
        const response = await this.#comunica.query(query, { sources })

        if (response.type === 'update') {
            return response.updateResult
        }
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

    async getMarkings (chapter) {
        const markings = await this.query(`
        PREFIX biblogos: <https://biblogos.info/ttl/ontology#>

        SELECT ?subject ?reference ?name (COALESCE(?class_predicate, ?property_predicate) as ?predicate) ?comment {
            ?subject biblogos:reference ?reference .
            OPTIONAL { ?subject biblogos:name ?name . }
            OPTIONAL { ?subject biblogos:comment ?comment . }
            OPTIONAL { ?subject a ?class_predicate . }
            OPTIONAL { ?subject biblogos:predicate ?property_predicate . }
            FILTER strstarts(?reference, """${`${this.#bookAbbreviation}.${chapter}"""`})
        }
        `, [ this.#store ])

        for (const marking of markings) marking.reference = new ReferenceProxy(marking.reference)

        return markings
    }

    async searchSubject (searchTerms, predicate) {
        return this.query(`
        PREFIX biblogos: <https://biblogos.info/ttl/ontology#>
        SELECT * { 
            ?predicate a <${predicate}> .
            ?predicate biblogos:name ?name .
            ?predicate a/a rdfs:Class .
            OPTIONAL { ?predicate biblogos:comment ?comment . }
            FILTER contains(?name, """${searchTerms[0]}""")
        }
    `, [ this.#store, ONTOLOGY ])
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

    async insertFact (object: FactObject) {
        await this.deleteFact(object.uri)
        return await this.query(`
        PREFIX biblogos: <https://biblogos.info/ttl/ontology#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        INSERT DATA { 
            <${object.uri}> a <${object.predicate}> .
            <${object.uri}> biblogos:name """${object.name}""" .

            ${object.references.map(reference => `
                <${object.uri}> biblogos:reference """${reference}""" .
            `)}
            
            ${object.subject ? `
                <${object.uri}> biblogos:subject <${object.subject}> .
            ` : ''}
            ${object.comment ? `
                <${object.uri}> biblogos:comment """${object.comment}""" .
            ` : ''}
        } 
        `, [ this.#store ])
    }

    async appendFactReferences (predicate: string, references: Array<string>) {
        return this.query(`
        PREFIX biblogos: <https://biblogos.info/ttl/ontology#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        
        INSERT DATA { 
            ${references.map(reference => `
                <${predicate}> biblogos:reference """${reference}""" .
            `)}
        }
        `, [ this.#store ])
    }

    async removeFactReferences (predicate: string, references: Array<string>) {
        return this.query(`
        PREFIX biblogos: <https://biblogos.info/ttl/ontology#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        
        DELETE DATA { 
            ${references.map(reference => `
                <${predicate}> biblogos:reference """${reference}""" .
            `)}
        }
        `, [ this.#store ])
    }


    async deleteFact (factUri: string) {
        return this.query(`
        PREFIX biblogos: <https://biblogos.info/ttl/ontology#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        DELETE { 
            <${factUri}> a ?type .
            <${factUri}> biblogos:name ?name .
            <${factUri}> biblogos:subject ?subject .
            <${factUri}> biblogos:reference ?reference .
            <${factUri}> biblogos:comment ?comment . 
        } WHERE { 
            <${factUri}> a ?type .
            <${factUri}> biblogos:name ?name .
            <${factUri}> biblogos:reference ?reference .
            OPTIONAL { <${factUri}> biblogos:comment ?comment . }
            OPTIONAL { <${factUri}> biblogos:subject ?subject . }
        }        
        `, [ this.#store ])
    }

}