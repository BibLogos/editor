import { html } from 'ube'

type RouteWithTemplate = {
    template: () => typeof html,
    redirect?: () => string
}

type RouteWithRedirect = {
    template?: () => typeof html,
    redirect: () => string
}

export type Route = RouteWithTemplate | RouteWithRedirect
