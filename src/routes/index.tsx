import { createFileRoute } from '@tanstack/react-router'
import React, { useCallback, useEffect, useMemo, useReducer } from 'react'
import type { AttendanceConfig } from '@/components/attendance/types'
import { defaultConfig } from '@/components/attendance/types'
import { saveToLocalStorage, loadFromLocalStorage } from '@/components/attendance/utils'
import { BrandingStep } from '@/components/attendance/BrandingStep'
import { TimelineStep } from '@/components/attendance/TimelineStep'
import { StudentImportStep } from '@/components/attendance/StudentImportStep'
import { PreviewStep } from '@/components/attendance/PreviewStep'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const STEPS = [
  { id: 1, label: 'Branding', shortLabel: '1. Branding' },
  { id: 2, label: 'Timeline', shortLabel: '2. Timeline' },
  { id: 3, label: 'Students', shortLabel: '3. Students' },
  { id: 4, label: 'Preview & Export', shortLabel: '4. Export' },
]

const FAQ_ITEMS = [
  {
    q: 'How do I generate an attendance sheet?',
    a: 'Use our 4-step wizard: enter institute details in Step 1, select the month and year in Step 2, import your student list in Step 3, then preview and download as Excel or PDF in Step 4.',
  },
  {
    q: 'Can I export attendance sheets to Excel?',
    a: 'Yes. Click the "Export Excel" button in Step 4 to download a formatted XLSX file with all student rows and working-day columns.',
  },
  {
    q: 'Does the tool exclude weekends automatically?',
    a: 'Yes. Saturdays and Sundays are automatically excluded. You can also mark additional holidays in Step 2.',
  },
  {
    q: 'How do I import students in bulk?',
    a: 'Paste tab-separated or pipe-separated data (ID | Name | Father Name) or upload a CSV file in Step 3.',
  },
  {
    q: 'Is my data saved if I accidentally close the browser?',
    a: 'Yes. The tool automatically saves your session to localStorage so your data is restored on your next visit.',
  },
  {
    q: 'Can I add a watermark to the PDF?',
    a: 'Yes. In Step 4, select a watermark option (DRAFT, CONFIDENTIAL, SAMPLE) before exporting the PDF.',
  },
]

function configReducer(state: AttendanceConfig, action: Partial<AttendanceConfig>): AttendanceConfig {
  return { ...state, ...action }
}

function HomePage() {
  const [step, setStep] = React.useState(1)
  const [config, dispatch] = useReducer(configReducer, defaultConfig, () => {
    if (typeof window !== 'undefined') {
      return loadFromLocalStorage() ?? defaultConfig
    }
    return defaultConfig
  })
  const [darkMode, setDarkMode] = React.useState(false)
  const [openFaq, setOpenFaq] = React.useState<number | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = loadFromLocalStorage()
      if (saved) dispatch(saved)
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setDarkMode(prefersDark)
    }
  }, [])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', darkMode)
    }
  }, [darkMode])

  useEffect(() => {
    saveToLocalStorage(config)
  }, [config])

  const onChange = useCallback((partial: Partial<AttendanceConfig>) => {
    dispatch(partial)
  }, [])

  const progress = Math.round((step / STEPS.length) * 100)

  return (
    <div className={`min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100`}>
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 print:hidden" role="banner">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" aria-label="AttendanceSheet Pro Home" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <span className="bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 rounded text-sm font-black">AS</span>
            AttendanceSheet Pro
          </a>
          <nav aria-label="Main navigation" className="hidden sm:flex items-center gap-6 text-sm font-medium">
            <a href="#tool" className="hover:underline underline-offset-4">Tool</a>
            <a href="#features" className="hover:underline underline-offset-4">Features</a>
            <a href="#how-it-works" className="hover:underline underline-offset-4">How It Works</a>
            <a href="#faq" className="hover:underline underline-offset-4">FAQ</a>
          </nav>
          <button
            onClick={() => setDarkMode(d => !d)}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Hero / Landing Section */}
      <main>
        <section className="py-16 px-4 text-center border-b border-gray-100 dark:border-gray-800 print:hidden" aria-labelledby="hero-heading">
          <div className="max-w-3xl mx-auto">
            <nav aria-label="Breadcrumb" className="text-xs text-gray-400 mb-6">
              <ol className="flex justify-center items-center gap-2" itemScope itemType="https://schema.org/BreadcrumbList">
                <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                  <a itemProp="item" href="/" className="hover:underline"><span itemProp="name">Home</span></a>
                  <meta itemProp="position" content="1" />
                </li>
                <li aria-hidden>/</li>
                <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                  <span itemProp="name" className="text-gray-600 dark:text-gray-400">Attendance Sheet Generator</span>
                  <meta itemProp="position" content="2" />
                </li>
              </ol>
            </nav>
            <h1 id="hero-heading" className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Free Attendance Sheet<br />Generator for Educators
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-8">
              Create professional attendance registers for schools, colleges, and training institutes in minutes.
              Export to <strong>Excel (XLSX)</strong> or <strong>PDF</strong> with custom branding, holiday markers, and bulk student import.
            </p>
            <a href="#tool" className="inline-block px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Generate Attendance Sheet →
            </a>
          </div>
        </section>

        {/* Feature Highlights */}
        <section id="features" className="py-14 px-4 border-b border-gray-100 dark:border-gray-800 print:hidden" aria-labelledby="features-heading">
          <div className="max-w-5xl mx-auto">
            <h2 id="features-heading" className="text-2xl md:text-3xl font-bold text-center mb-10">Everything you need in an attendance tool</h2>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" role="list" aria-label="Feature list">
              {[
                { icon: '🏫', title: 'Custom Institute Branding', desc: 'Add your institute name, instructor, and choose from 3 header layouts with live preview.' },
                { icon: '📅', title: 'Smart Working Day Calculator', desc: 'Auto-excludes weekends. Mark custom holidays with a single click.' },
                { icon: '👥', title: 'Bulk Student Import', desc: 'Paste tab/pipe-separated data or upload a CSV file. Supports extra custom columns.' },
                { icon: '📊', title: 'Excel Export (XLSX)', desc: 'Download a formatted spreadsheet with all student rows and attendance columns.' },
                { icon: '📄', title: 'PDF Export (Landscape A4)', desc: 'Generate a print-ready PDF with institute header, signature line, and optional watermark.' },
                { icon: '💾', title: 'Auto-Save Sessions', desc: 'Your data is saved automatically to localStorage so you never lose progress.' },
              ].map(f => (
                <li key={f.title} className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <div className="text-2xl mb-2" aria-hidden>{f.icon}</div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
                </li>
              ))}
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

        {/* The Tool */}
        <section id="tool" className="py-12 px-4" aria-labelledby="tool-heading">
          <div className="max-w-5xl mx-auto">
            <h2 id="tool-heading" className="text-2xl font-bold text-center mb-8 print:hidden">Attendance Sheet Generator</h2>

            {/* Progress Stepper */}
            <div className="mb-8 print:hidden" role="navigation" aria-label="Wizard steps">
              {/* Progress bar */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Progress</span>
                <span className="text-sm font-medium" aria-live="polite">{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-5" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className="bg-black dark:bg-white h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex gap-1 sm:gap-2">
                {STEPS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setStep(s.id)}
                    aria-current={step === s.id ? 'step' : undefined}
                    className={`flex-1 py-2 px-1 sm:px-3 rounded-lg text-xs sm:text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-black ${
                      step === s.id
                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                        : step > s.id
                        ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{s.id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-white dark:bg-gray-900 shadow-sm print:border-0 print:p-0 print:shadow-none">
              {step === 1 && <BrandingStep config={config} onChange={onChange} />}
              {step === 2 && <TimelineStep config={config} onChange={onChange} />}
              {step === 3 && <StudentImportStep config={config} onChange={onChange} />}
              {step === 4 && <PreviewStep config={config} onChange={onChange} />}

              {/* Navigation */}
              <div className="flex justify-between mt-8 print:hidden">
                {step > 1 ? (
                  <button
                    onClick={() => setStep(s => s - 1)}
                    className="px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:border-black dark:hover:border-white focus:outline-none focus:ring-2 focus:ring-black"
                    aria-label="Go to previous step"
                  >
                    ← Back
                  </button>
                ) : <div />}
                {step < STEPS.length && (
                  <button
                    onClick={() => setStep(s => s + 1)}
                    className="px-5 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-sm font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-black"
                    aria-label="Go to next step"
                  >
                    Continue →
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-14 px-4 border-t border-gray-100 dark:border-gray-800 print:hidden" aria-labelledby="faq-heading">
          <div className="max-w-3xl mx-auto">
            <h2 id="faq-heading" className="text-2xl md:text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <dl className="space-y-3" itemScope itemType="https://schema.org/FAQPage">
              {FAQ_ITEMS.map((item, idx) => (
                <div
                  key={idx}
                  itemScope
                  itemType="https://schema.org/Question"
                  itemProp="mainEntity"
                  className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                >
                  <dt>
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      aria-expanded={openFaq === idx}
                      aria-controls={`faq-answer-${idx}`}
                      className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black"
                      itemProp="name"
                    >
                      {item.q}
                      <span aria-hidden className="ml-4 text-gray-400 flex-shrink-0">{openFaq === idx ? '−' : '+'}</span>
                    </button>
                  </dt>
                  {openFaq === idx && (
                    <dd
                      id={`faq-answer-${idx}`}
                      className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800"
                      itemScope
                      itemType="https://schema.org/Answer"
                      itemProp="acceptedAnswer"
                    >
                      <span itemProp="text">{item.a}</span>
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-10 px-4 print:hidden" role="contentinfo">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="font-bold text-lg mb-2">AttendanceSheet Pro</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Free online attendance register generator for schools, colleges, and training institutes. No signup required.
              </p>
            </div>
            <div>
              <div className="font-semibold mb-3 text-sm">Tool Features</div>
              <ul className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#tool" className="hover:text-black dark:hover:text-white hover:underline">Attendance Sheet Generator</a></li>
                <li><a href="#features" className="hover:text-black dark:hover:text-white hover:underline">Excel Attendance Export</a></li>
                <li><a href="#features" className="hover:text-black dark:hover:text-white hover:underline">PDF Attendance Register</a></li>
                <li><a href="#features" className="hover:text-black dark:hover:text-white hover:underline">Bulk Student CSV Import</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-3 text-sm">For Educators</div>
              <ul className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#tool" className="hover:text-black dark:hover:text-white hover:underline">School Attendance Sheet</a></li>
                <li><a href="#tool" className="hover:text-black dark:hover:text-white hover:underline">College Class Register</a></li>
                <li><a href="#tool" className="hover:text-black dark:hover:text-white hover:underline">Training Institute Attendance</a></li>
                <li><a href="#faq" className="hover:text-black dark:hover:text-white hover:underline">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} AttendanceSheet Pro. Free tool for educators. No data is stored on our servers.
          </div>
        </div>
      </footer>
    </div>
  )
}
