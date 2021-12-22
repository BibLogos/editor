import { importGlobalScript } from '../Helpers/importGlobalScript'
import { ReferenceProxy } from './ReferenceProxy'
import { ComunicaExport, FactObject, MarkingsEditorChange } from '../types'
import { StoreProxy } from './StoreProxy'

const ONTOLOGY = `${location.protocol}//${location.hostname}:${location.port}/ttl/ontology.ttl`

export class MarkingsStore extends EventTarget {

    #store
    #comunica
    #bookAbbreviation

    public changes: Array<MarkingsEditorChange> = []

    constructor (store, bookAbbreviation) {
        super()
        const [proxiedStore, storeEventTarget] = StoreProxy(store)
        this.#store = proxiedStore

        this.#bookAbbreviation = bookAbbreviation

        storeEventTarget.addEventListener('removeQuad', (event) => {
            this.changes.push(['removed', event.detail, new Date()])
        })

        storeEventTarget.addEventListener('addQuad', (event) => {
            this.changes.push(['added', event.detail, new Date()])
        })
    }

    get bookAbbreviation () {
        return this.#bookAbbreviation
    }

    async query (query, sources: any, debug = false) {
        if (debug) console.log(query)
        if (!this.#comunica) {
            const { newEngine } = await importGlobalScript('https://rdf.js.org/comunica-browser/versions/latest/packages/actor-init-sparql/comunica-browser.js', 'Comunica') as ComunicaExport
            this.#comunica = newEngine()
        }

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

    async searchSubject (searchTerms, predicate, linkedSubject = null) {
        if (searchTerms.length === 0 || searchTerms.length === 1 && searchTerms[0].trim() === '') return []

        return this.query(`
        PREFIX biblogos: <https://biblogos.info/ttl/ontology#>
        SELECT * { 
            ?predicate a <${predicate}> .
            ?predicate biblogos:name ?name .
            ?predicate a/a rdfs:Class .
            OPTIONAL { ?predicate biblogos:comment ?comment . }
            FILTER regex(?name, """${searchTerms.join('|')}""", "i")
        }
        LIMIT 10
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
            `).join('\n')}
            
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

    async getReferencesCountForFact (factUri: string) {
        const results = await this.query(`
        PREFIX biblogos: <https://biblogos.info/ttl/ontology#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        
        SELECT (count(?reference) as ?count) {
            <${factUri}> biblogos:reference ?reference .
        }
        `, [ this.#store ])

        return parseInt(results[0])
    }

}