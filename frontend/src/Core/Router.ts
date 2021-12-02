import UniversalRouter from 'universal-router'

import { Home } from '../Routes/Home'
import { Editor } from '../Routes/Editor'
import { OauthCallback } from '../Routes/OauthCallback'
import { Login } from '../Routes/Login'
import { NotFound } from '../Routes/NotFound'

const routes = [
  { path: '/', action: () => Home },
  { path: '/editor', action: () => Editor },
  { path: '/login', action: () => Login },
  { path: '/oauth-callback', action: () => OauthCallback },
  { path: '(.*)', action: () => NotFound }
]

export const Router = new UniversalRouter(routes)

export const goTo = (path) => {
  if (location.pathname !== path) location.pathname = path
}