import React from 'react'
import { Link } from '@tanstack/react-router'
import { Home, SearchX } from 'lucide-react'

export function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-8 shadow-xl shadow-black/5 animate-in zoom-in duration-500">
        <SearchX size={40} className="text-zinc-400" />
      </div>
      <h1 className="text-4xl font-black mb-4 tracking-tight">Page Not Found</h1>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-10 leading-relaxed text-lg">
        The page you are looking for doesn't exist or has been moved to a new location.
      </p>
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 h-12 px-8 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-zinc-900"
      >
        <Home size={18} /> Back to Homepage
      </Link>
    </div>
  )
}
