import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Database, Home } from 'lucide-react'
export default function App() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2"><Database className="size-5"/><span className="font-semibold">MH Catalog</span></div>
          <nav className="ml-auto flex items-center gap-2">
            <NavLink to="/" className={({isActive})=>`btn ${isActive?'bg-gray-100':''}`}><Home className="size-4"/> Catalog</NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6"><Outlet/></main>
    </div>
  )
}