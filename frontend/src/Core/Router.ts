import UniversalRouter from 'universal-router'

import { Home } from '../Routes/Home'
import { Editor } from '../Routes/Editor'
import { OauthCallback } from '../Routes/OauthCallback'
import { Login } from '../Routes/Login'
import { NotFound } from '../Routes/NotFound'
import { Page } from '../Routes/Page'

import { app } from '../app'

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
  { path: '/editor/:ownerId/:repoId/:bookId?/:chapterId?', action: wrapAction(Editor) },
  { path: '/login', action: wrapAction(Login) },
  { path: '/oauth-callback', action: wrapAction(OauthCallback) },
  { path: '/:name', action: wrapAction(Page) },
  { path: '(.*)', action: wrapAction(NotFound) }
]

export const Router = new UniversalRouter(routes)

export const goTo = (path, replace = false) => {
  if (location.pathname !== path) history[replace ? 'replaceState' : 'pushState']({}, '', path)
  return app.render()
}