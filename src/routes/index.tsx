import { createFileRoute, Link } from '@tanstack/react-router'
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import type { AttendanceConfig, WorkspaceState, ClassProfile } from '@/components/attendance/types'
import { defaultConfig } from '@/components/attendance/types'
import { saveWorkspace, loadWorkspace } from '@/components/attendance/utils'
import { BrandingStep } from '@/components/attendance/BrandingStep'
import { TimelineStep } from '@/components/attendance/TimelineStep'
import { StudentImportStep } from '@/components/attendance/StudentImportStep'
import { PreviewStep } from '@/components/attendance/PreviewStep'
import { CheckCircle2, ChevronRight, FileSpreadsheet, Moon, Download, CalendarDays, Users, LayoutTemplate, Save, FileText, Sun, Plus, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const STEPS = [
  { id: 1, label: 'Branding', shortLabel: '1. Branding' },
  { id: 2, label: 'Timeline', shortLabel: '2. Timeline' },
  { id: 3, label: 'Students', shortLabel: '3. Students' },
  { id: 4, label: 'Export', shortLabel: '4. Export' },
]

import siteContent from '@/content/site-content.json'

function AdBanner({ slot }: { slot?: string }) {
  // Placeholder for AdSense integration.
  // We use fixed heights here to prevent Cumulative Layout Shift (CLS) for SEO.
  return (
    <div className="w-full max-w-[728px] mx-auto h-[90px] bg-zinc-100 dark:bg-zinc-800/50 rounded-xl my-8 flex items-center justify-center text-xs font-mono text-zinc-400 border border-zinc-200 dark:border-zinc-700/50 print:hidden relative overflow-hidden">
      {/* <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client="ca-pub-XXXXXX" data-ad-slot={slot || "xxxx"} data-ad-format="auto"></ins> */}
      <span className="flex items-center gap-2"><LayoutTemplate size={14} /> Advertisement Area</span>
    </div>
  )
}

function HomePage() {
  const [step, setStep] = useState(1)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const [hasMounted, setHasMounted] = useState(false)
  
  // Workspace State Management
  const [workspace, setWorkspace] = useState<WorkspaceState>({
    activeProfileId: 'default',
    profiles: [{ id: 'default', name: 'My Class', config: defaultConfig }],
    darkMode: false
  })

  // Set the workspace and mounted status on client-side
  useEffect(() => {
    setHasMounted(true)
    const saved = loadWorkspace()
    if (saved) {
      setWorkspace(saved)
      document.documentElement.classList.toggle('dark', saved.darkMode)
    }
  }, [])

  // Derived active config
  const activeProfile = workspace.profiles.find(p => p.id === workspace.activeProfileId) || workspace.profiles[0]
  const config = activeProfile.config

  // Sync to localstorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveWorkspace(workspace)
      document.documentElement.classList.toggle('dark', workspace.darkMode)
    }
  }, [workspace])

  // Initial dark mode sync
  useEffect(() => {
    if (typeof window !== 'undefined' && !loadWorkspace()) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setWorkspace(w => ({ ...w, darkMode: prefersDark }))
    }
  }, [])

  const updateConfig = useCallback((partial: Partial<AttendanceConfig>) => {
    setWorkspace(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => 
        p.id === prev.activeProfileId ? { ...p, config: { ...p.config, ...partial } } : p
      )
    }))
  }, [])

  const createProfile = () => {
    const name = window.prompt("Enter class or batch name:")
    if (name) {
      const id = Date.now().toString()
      setWorkspace(prev => ({
        ...prev,
        activeProfileId: id,
        profiles: [...prev.profiles, { id, name, config: defaultConfig }]
      }))
    }
  }

  const deleteProfile = (id: string) => {
    if (workspace.profiles.length === 1) return alert("You must have at least one profile.")
    if (window.confirm("Delete this class profile?")) {
      setWorkspace(prev => ({
        ...prev,
        activeProfileId: prev.activeProfileId === id ? prev.profiles.find(p => p.id !== id)!.id : prev.activeProfileId,
        profiles: prev.profiles.filter(p => p.id !== id)
      }))
    }
  }

  const progress = Math.round((step / STEPS.length) * 100)

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 print:hidden" role="banner">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" aria-label="AttendanceSheet Pro Home" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div className="w-8 h-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg flex items-center justify-center font-black">AS</div>
            AttendanceSheet Pro
          </a>
          <nav aria-label="Main navigation" className="hidden sm:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <a href="#tool" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Generator</a>
            <a href="#features" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Features</a>
            <Link to="/blog" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Blog</Link>
          </nav>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setWorkspace(w => ({ ...w, darkMode: !w.darkMode }))}
              aria-label={workspace.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {workspace.darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* AdSense Above Fold */}
        <AdBanner slot="above-fold-1" />

        {/* Hero Section */}
        <section className="py-20 px-4 text-center print:hidden">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
              The modern attendance sheet <br className="hidden md:block"/>generator for educators.
            </h1>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
              Create and export professional attendance registers in seconds. 
              Manage multiple classes, auto-exclude weekends, and export seamlessly to Excel or PDF. 100% free.
            </p>
            <div className="flex items-center justify-center gap-4">
              <a href="#tool" className="inline-flex items-center gap-2 h-12 px-6 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl font-semibold hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl">
                Start Generating <ChevronRight size={18} />
              </a>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section id="features" className="py-20 px-4 bg-white dark:bg-zinc-900 border-y border-zinc-100 dark:border-zinc-800 print:hidden">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 tracking-tight">Built for modern educators</h2>
              <p className="text-zinc-500 max-w-2xl mx-auto">Everything you need to automate your register workflow, packed into a beautiful distraction-free interface.</p>
            </div>
            
            <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
              {siteContent.features.map(f => {
                const Icon = { LayoutTemplate, CalendarDays, Users, FileSpreadsheet, FileText, Save }[f.icon as any] || LayoutTemplate
                const colorClass = {
                  blue: 'text-blue-500',
                  indigo: 'text-indigo-500',
                  teal: 'text-teal-500',
                  emerald: 'text-emerald-500',
                  rose: 'text-rose-500',
                  amber: 'text-amber-500'
                }[f.color] || 'text-zinc-500'

                return (
                  <li key={f.title} className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-4 shadow-sm">
                      <Icon className={colorClass} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{f.desc}</p>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-14 px-4 border-b border-gray-100 dark:border-gray-800 print:hidden" aria-labelledby="how-heading">
          <div className="max-w-3xl mx-auto text-center">
            <h2 id="how-heading" className="text-2xl md:text-3xl font-bold mb-10">How It Works</h2>
            <ol className="space-y-6 text-left" role="list">
              {[
                { n: '01', t: 'Enter Institute Details', d: 'Add your institution name, course, batch, and instructor. Choose a header layout.' },
                { n: '02', t: 'Select Month & Mark Holidays', d: 'Pick the year and month. Click on any weekday to mark it as a holiday.' },
                { n: '03', t: 'Import Your Students', d: 'Paste a list or upload a CSV file. Students appear in a live preview table.' },
                { n: '04', t: 'Preview & Export', d: 'Review the attendance register, then export to Excel or PDF — or print directly.' },
              ].map(s => (
                <li key={s.n} className="flex gap-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black font-black text-sm flex items-center justify-center" aria-hidden>
                    {s.n}
                  </span>
                  <div>
                    <h3 className="font-semibold">{s.t}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* AdSense Mid Page */}
        <AdBanner slot="mid-page" />

        {/* The Generator Tool */}
        <section id="tool" className="py-16 px-4" aria-labelledby="tool-heading">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 print:hidden gap-4">
              <div>
                <h2 id="tool-heading" className="text-3xl font-black tracking-tight">Generator Tool</h2>
                <p className="text-zinc-500 text-sm mt-1">Configure and export your attendance register.</p>
              </div>
              
              {/* Profile Switcher */}
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-xl flex items-center shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mx-3 hidden sm:inline">Profile</span>
                <select
                  aria-label="Select Class Profile"
                  value={workspace.activeProfileId}
                  onChange={(e) => setWorkspace(w => ({ ...w, activeProfileId: e.target.value }))}
                  className="bg-transparent text-sm font-semibold focus:outline-none focus:ring-0 mr-2 cursor-pointer appearance-none px-2"
                >
                  {workspace.profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <div className="flex items-center gap-1 border-l border-zinc-200 dark:border-zinc-700 pl-2">
                  <button onClick={createProfile} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white" title="New Profile"><Plus size={16} /></button>
                  <button onClick={() => deleteProfile(workspace.activeProfileId)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-zinc-500 hover:text-red-600 dark:hover:text-red-400" title="Delete Profile"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl md:rounded-3xl shadow-xl shadow-black/5 overflow-hidden print:border-0 print:shadow-none">
              
              {/* Wizard Steps Header */}
              <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 p-2 print:hidden overflow-x-auto hide-scrollbar">
                {STEPS.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setStep(s.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      step === s.id
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/50 dark:border-zinc-700/50'
                        : step > s.id
                        ? 'text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-800/50'
                        : 'text-zinc-400 dark:text-zinc-500 hover:bg-white/50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    {step > s.id ? <CheckCircle2 size={16} className="text-emerald-500" /> : <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">{s.id}</span>}
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Progress Bar (Thin) */}
              <div className="h-0.5 bg-zinc-100 dark:bg-zinc-800 w-full print:hidden">
                <div className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
              </div>

              {/* Step Content Area */}
              <div className="p-6 md:p-8 min-h-[400px]">
                {step === 1 && <BrandingStep config={config} onChange={updateConfig} />}
                {step === 2 && <TimelineStep config={config} onChange={updateConfig} />}
                {step === 3 && <StudentImportStep config={config} onChange={updateConfig} />}
                {step === 4 && <PreviewStep config={config} onChange={updateConfig} />}
              </div>
              
              {/* Navigation Footer */}
              <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 p-6 flex justify-between print:hidden">
                {step > 1 ? (
                  <button
                    onClick={() => setStep(s => s - 1)}
                    className="h-10 px-6 rounded-xl font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Previous
                  </button>
                ) : <div />}
                
                {step < STEPS.length && (
                  <button
                    onClick={() => setStep(s => s + 1)}
                    className="h-10 px-8 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-zinc-900 dark:ring-white dark:focus-visible:ring-offset-zinc-900 flex items-center gap-2"
                  >
                    Next Step <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 px-4 flex flex-col items-center print:hidden">
          <div className="max-w-3xl w-full">
            <h2 className="text-3xl font-bold text-center mb-10 tracking-tight">Frequently Asked Questions</h2>
            <dl className="space-y-4" itemScope itemType="https://schema.org/FAQPage">
              {siteContent.faq.map((item, idx) => (
                <div key={idx} itemScope itemType="https://schema.org/Question" itemProp="mainEntity" className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
                  <dt>
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      aria-expanded={openFaq === idx}
                      className="w-full flex items-center justify-between px-6 py-5 text-left font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                      itemProp="name"
                    >
                      {item.q}
                      <span aria-hidden className="ml-4 text-zinc-400 flex-shrink-0 transition-transform duration-200" style={{ transform: openFaq === idx ? 'rotate(180deg)' : '' }}>
                         <ChevronRight size={20} className="rotate-90" />
                      </span>
                    </button>
                  </dt>
                  {openFaq === idx && (
                    <dd className="px-6 pb-5 text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-4" itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                      <span itemProp="text">{item.a}</span>
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <AdBanner slot="footer" />

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-12 px-4 print:hidden" role="contentinfo">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-12 gap-8 mb-12">
            <div className="sm:col-span-5">
              <div className="font-bold text-xl mb-4 tracking-tight flex items-center gap-2">
                <div className="w-6 h-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-md flex items-center justify-center font-black text-xs">AS</div>
                AttendanceSheet Pro
              </div>
              <p className="text-zinc-500 max-w-sm leading-relaxed">
                Empowering educators with clean, efficient tools. Free online attendance register generator for schools, colleges, and training institutes.
              </p>
            </div>
            <div className="sm:col-span-3 sm:col-start-7">
              <div className="font-semibold mb-4 text-sm uppercase tracking-wider text-zinc-400">Toolkit</div>
              <ul className="space-y-3 text-zinc-600 dark:text-zinc-400">
                <li><a href="#tool" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Generator Engine</a></li>
                <li><Link to="/blog" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Educator Blog</Link></li>
                <li><a href="#faq" className="hover:text-zinc-900 dark:hover:text-white transition-colors">FAQ & Support</a></li>
              </ul>
            </div>
            <div className="sm:col-span-3">
              <div className="font-semibold mb-4 text-sm uppercase tracking-wider text-zinc-400">Governance</div>
              <ul className="space-y-3 text-zinc-600 dark:text-zinc-400">
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Privacy Policy</a></li>
                <li><Link to="/admin-dashboard" className="hover:text-zinc-900 dark:hover:text-white transition-colors font-bold">Admin Dashboard</Link></li>
                <li><a href="/admin/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">CMS Console</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
            <p>© {new Date().getFullYear()} AttendanceSheet Pro. All rights reserved.</p>
            <p>100% Client-side. Privacy first.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
