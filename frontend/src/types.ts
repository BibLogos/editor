import { html } from 'ube'
import type { components } from '@octokit/openapi-types'

type RouteWithTemplate = {
    template: () => typeof html,
    redirect?: () => string
    [key: string]: any
    params?: Array<string>
}

type RouteWithRedirect = {
    template?: () => typeof html,
    redirect: () => string
    [key: string]: any
    params?: Array<string>
}

export type Route = RouteWithTemplate | RouteWithRedirect

export type BibleReference = {
    bible: string
    language: string
    book: string
    chapter: string
}

export type Bible = {
    abbreviation: string,
    abbreviationLocal: string,
    audioBibles: Array<any>,
    countries: Array<any>,
    dblId: string,
    description: string,
    descriptionLocal: string,
    id: string,
    language: Language,
    name: string,
    nameLocal: string,
    relatedDbl: string,
    type: string,
    updatedAt: string
}

export type Language = {
    id: string,
    name: string,
    nameLocal: string,
    script: string,
    scriptDirection: string
}

export type FactPart = {
    text: string,
    clear?: Function,
    elements: Array<HTMLElement>,
    type: 'subject' | 'predicate' | 'object'
}

declare global {
    var Comunica: any;
}

export type ComunicaExport = {
    newEngine: Function
}

export type FactObject = {
    uri: string
    name: string
    predicate: string
    subject?: string
    range: string
    comment: string
}

export type ProjectData = components["schemas"]["repo-search-result-item"]
