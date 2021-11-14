import { html } from 'ube'

type RouteWithTemplate = {
    template: () => typeof html,
    redirect?: () => string
    [key: string]: any
}

type RouteWithRedirect = {
    template?: () => typeof html,
    redirect: () => string
    [key: string]: any
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