import UniversalRouter from 'universal-router'

import { Home } from '../Routes/Home'
import { Login } from '../Routes/Login'
import { Editor } from '../Routes/Editor'
import { NotFound } from '../Routes/NotFound'

const routes = [
  { path: '/', action: () => Home },
  { path: '/login', action: () => Login },
  { path: '/editor', action: () => Editor },
  { path: '(.*)', action: () => NotFound }
]

export const Router = new UniversalRouter(routes)

export const goTo = (path) => {
  if (location.pathname !== path) location.pathname = path
}