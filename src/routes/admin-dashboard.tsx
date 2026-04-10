import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import React, { useEffect, useState } from 'react'
import { loadWorkspace } from '@/components/attendance/utils'
import { LayoutDashboard, Users, FileText, Settings, LogOut, ShieldCheck, Database, Download, ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/admin-dashboard')({
  component: AdminDashboard,
})

declare global {
  interface Window {
    netlifyIdentity: any
  }
}

function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ profiles: 0, students: 0 })
  const router = useRouter()

  useEffect(() => {
    const initAuth = () => {
      if (window.netlifyIdentity) {
        const currentUser = window.netlifyIdentity.currentUser()
        if (currentUser) {
          setUser(currentUser)
        } else {
          window.netlifyIdentity.open()
        }
        
        window.netlifyIdentity.on('login', (u: any) => {
          setUser(u)
          window.netlifyIdentity.close()
        })
        
        window.netlifyIdentity.on('logout', () => {
          setUser(null)
          router.navigate({ to: '/' })
        })
      }
      setLoading(false)
    }

    if (document.readyState === 'complete') {
      initAuth()
    } else {
      window.addEventListener('load', initAuth)
      return () => window.removeEventListener('load', initAuth)
    }
  }, [router])

  useEffect(() => {
    const ws = loadWorkspace()
    if (ws) {
      const totalStudents = ws.profiles.reduce((sum, p) => sum + p.config.students.length, 0)
      setStats({
        profiles: ws.profiles.length,
        students: totalStudents
      })
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-6 shadow-xl shadow-black/5">
          <ShieldCheck size={32} className="text-zinc-400" />
        </div>
        <h1 className="text-2xl font-black mb-2">Admin Access Required</h1>
        <p className="text-zinc-500 mb-8">Please log in with your team credentials to proceed.</p>
        <button 
          onClick={() => window.netlifyIdentity.open()}
          className="h-12 px-8 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          Login to Dashboard
        </button>
        <Link to="/" className="mt-6 text-sm text-zinc-400 hover:text-zinc-900 flex items-center gap-2">
           <ArrowLeft size={14} /> Back to public site
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 hidden md:flex flex-col">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="font-bold text-lg tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg flex items-center justify-center font-black">AS</div>
            Team Admin
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white transition-all">
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl text-sm font-medium transition-all">
            <Users size={18} /> User Management
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl text-sm font-medium transition-all">
            <FileText size={18} /> Content Manager
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl text-sm font-medium transition-all">
            <Settings size={18} /> Site Settings
          </button>
        </nav>

        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
          <button 
            onClick={() => window.netlifyIdentity.logout()}
            className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl text-sm font-semibold transition-all"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <header className="mb-12 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-2">Welcome back, {user.user_metadata?.full_name || 'Admin'}</h1>
            <p className="text-zinc-500">Here's what's happening with AttendanceSheet Pro today.</p>
          </div>
          <Link to="/" className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md transition-all text-zinc-500" title="View Site">
            <ArrowLeft size={20} />
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-500 mb-4">
              <Users size={24} />
            </div>
            <p className="text-sm font-medium text-zinc-500 mb-1">Active Profiles (Local)</p>
            <h3 className="text-4xl font-black">{stats.profiles}</h3>
          </div>
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
              <Database size={24} />
            </div>
            <p className="text-sm font-medium text-zinc-500 mb-1">Imported Students</p>
            <h3 className="text-4xl font-black">{stats.students}</h3>
          </div>
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm italic text-zinc-300 flex items-center justify-center text-center px-10">
             Cloud analytics integration pending...
          </div>
        </div>

        {/* Manage Content Block */}
        <div className="bg-zinc-900 dark:bg-white rounded-3xl p-8 text-white dark:text-zinc-900 flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold mb-3">Content Hub</h2>
            <p className="opacity-70 leading-relaxed">Manage your blog posts, FAQ items, and feature lists directly via Decap CMS.</p>
          </div>
          <a 
            href="/admin/" 
            className="h-12 px-8 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl font-bold flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          >
            Launch CMS Console
          </a>
        </div>

        {/* Global Config Section */}
        <div className="mt-12">
           <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
             <Settings size={20} className="text-zinc-400" /> System Configuration
           </h2>
           <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                 <h4 className="font-bold mb-4">Data Persistence</h4>
                 <div className="space-y-4">
                    <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 transition-colors">
                       <div className="flex items-center gap-3 text-sm font-semibold">
                          <Download size={18} className="text-zinc-400" /> Export Full Workspace JSON
                       </div>
                    </button>
                    <p className="text-[10px] text-zinc-400">Download a complete backup of your browser's local state for and class profiles.</p>
                 </div>
              </div>
              <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 text-sm border-dashed">
                 Additional system settings will appear here.
              </div>
           </div>
        </div>
      </main>
    </div>
  )
}
