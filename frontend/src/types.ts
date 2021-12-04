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

declare global {
    var Comunica: any;
}

export type ComunicaExport = {
    newEngine: Function
}

export type ProjectData = components["schemas"]["repo-search-result-item"]
