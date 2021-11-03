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