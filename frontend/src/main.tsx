import React from 'react'
import ReactDOM from 'react-dom/client'
import Editor from './Routes/Editor.tsx'
import { api } from './Helpers/api.ts'
import { init } from './Services/GitHub.ts'

import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom"

const router = createBrowserRouter([
  {
    path: '/',
    element: <h1>Welcome</h1>
  },
  {
    path: '/login',
    loader: () => {
      return redirect(`${api}/login`)
    }
  },
  {
    path: '/oauth-callback',
    loader: async () => {
      const search = new URLSearchParams(location.search)
      const code = search.get('code')
      localStorage.githubCode = code
      
      await init()

      if (localStorage.redirectUrl) {
          const redirectUrl = localStorage.redirectUrl
          localStorage.removeItem('redirectUrl')
          return redirect(redirectUrl)
      }

      return redirect(`/`)
    }
  },
  {
    path: "/editor/:ownerId/:repoId/:bookId?/:chapterId?",
    element: <Editor />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
