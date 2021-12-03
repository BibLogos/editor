import UniversalRouter from 'universal-router'

import { Home } from '../Routes/Home'
import { Editor } from '../Routes/Editor'
import { OauthCallback } from '../Routes/OauthCallback'
import { Login } from '../Routes/Login'
import { NotFound } from '../Routes/NotFound'

export let context, params

const wrapAction = (route) => {
  return (givenContext, givenParams) => {
    context = givenContext
    params = givenParams
    return route
  }
}

const routes = [
  { path: '/', action: wrapAction(Home) },
  { path: '/:ownerId/:repoId/:bookId?/:chapterId?', action: wrapAction(Editor) },
  { path: '/login', action: wrapAction(Login) },
  { path: '/oauth-callback', action: wrapAction(OauthCallback) },
  { path: '(.*)', action: wrapAction(NotFound) }
]

export const Router = new UniversalRouter(routes)

export const goTo = (path) => {
  if (location.pathname !== path) history.pushState({}, '', path)
}