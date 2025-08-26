import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './ui/App'
import { ModelsList } from './ui/pages/ModelsList'
import { ModelDetail } from './ui/pages/ModelDetail'

const router = createBrowserRouter([{ path: '/', element: <App/>, children: [
  { index: true, element: <ModelsList/> },
  { path: 'models/:id', element: <ModelDetail/> }
]}])

createRoot(document.getElementById('root')!).render(<React.StrictMode><RouterProvider router={router}/></React.StrictMode>)