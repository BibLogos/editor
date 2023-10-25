import type { components } from '@octokit/openapi-types'
export type ProjectData = components["schemas"]["repo-search-result-item"]
import { textSources } from './src/Plugins/TextSources/textSources'
import type { NamedNode, Quad, Term } from '@rdfjs/types'

export type TextSources = typeof textSources

export type Book<T extends object> = {
    name: string
    type: keyof TextSources
    files: Array<{ file: string }>
} & T

export type Chapter = Array<[paragraphId: string | number, text: string]>

export type GrapoiPointer = {
    in: (predicates?: Array<NamedNode>, objects?: Array<NamedNode>) => GrapoiPointer
    out: (predicates?: Array<NamedNode | null>, subjects?: Array<NamedNode>) => GrapoiPointer,
    hasOut: (predicates?: Array<NamedNode | null>, subjects?: Array<NamedNode>) => GrapoiPointer
    deleteOut: (predicates?: Array<any> | any, objects?: Array<any> | any) => GrapoiPointer,
    addOut: (predicates?: Array<any> | any, objects?: Array<any> | any) => GrapoiPointer,
    quads: () => Array<Quad>
    trim(): GrapoiPointer
    distinct(): GrapoiPointer
    values: Array<any>
    filter: (item: any) => boolean
    value: any
    isList: () => Boolean,
    deleteList: () => GrapoiPointer,
    list: () => Array<GrapoiPointer>
    ptrs: Array<any>
    clone: (data: any) => GrapoiPointer  
    node: (pointers?: Array<any>) => GrapoiPointer
    execute: (paths: Array<any>) => GrapoiPointer
    executeAll: (paths: Array<any>) => GrapoiPointer
    replace: (replacement: any) => GrapoiPointer
    term: Term
    terms: Array<Term>
    [Symbol.iterator]: () => Iterator<any>
  }