import React from 'react'
import ReactDOM from 'react-dom/client'
import Editor from './Routes/Editor.tsx'

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom"

const router = createBrowserRouter([
  {
    path: '/',
    element: <h1>Welcome</h1>
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
