import { html } from 'ube'
import type { components } from '@octokit/openapi-types'
import { Quad } from 'n3'

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

declare global {
    var Comunica: any;
}

export type ComunicaExport = {
    newEngine: Function
}

export type ProjectData = components["schemas"]["repo-search-result-item"]

export interface PopupPartInterface {
    applies: () => boolean
    template: () => typeof html
}

export type FactObject = {
    uri: string
    name: string
    predicate: string
    subject?: string
    references: Array<string>
    comment: string
}

export type MarkingsEditorChange = ['added' | 'removed', Quad, Date]