import React, { useState } from 'react'
import type { AttendanceConfig, HeaderLayout } from './types'
import { Tooltip } from './Tooltip'
import { School, User2, BookOpen, Layers, LayoutTemplate, Plus, X } from 'lucide-react'

interface Props {
  config: AttendanceConfig
  onChange: (partial: Partial<AttendanceConfig>) => void
}

const layouts: { id: HeaderLayout; label: string; desc: string; icon: React.ReactNode } = [
  { id: 'centered', label: 'Centered', desc: 'Logo and text centered', icon: <div className="w-6 h-4 border-2 border-current rounded mx-auto flex flex-col items-center justify-center gap-0.5"><div className="w-1/2 h-0.5 bg-current rounded-full"/><div className="w-1/3 h-0.5 bg-current rounded-full"/></div> },
  { id: 'split', label: 'Split View', desc: 'Name left, details right', icon: <div className="w-6 h-4 border-2 border-current rounded mx-auto flex items-center justify-between px-0.5"><div className="w-1/3 h-0.5 bg-current rounded-full"/><div className="w-1/3 h-0.5 bg-current rounded-full"/></div> },
  { id: 'boxed-left', label: 'Boxed Left', desc: 'Boxed left-aligned header', icon: <div className="w-6 h-4 border-2 border-current rounded mx-auto flex flex-col items-start justify-center px-0.5 gap-0.5"><div className="w-1/2 h-0.5 bg-current rounded-full"/><div className="w-3/4 h-0.5 bg-current rounded-full"/></div> },
]

export function BrandingStep({ config, onChange }: Props) {
  const [newCol, setNewCol] = useState('')

  function addColumn() {
    const col = newCol.trim()
    if (col && !config.extraColumns.includes(col)) {
      onChange({ extraColumns: [...config.extraColumns, col] })
    }
    setNewCol('')
  }

  function removeColumn(col: string) {
    onChange({ extraColumns: config.extraColumns.filter(c => c !== col) })
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[350px]">
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="instituteName" className="flex items-center gap-2 text-sm font-semibold mb-2 text-zinc-900 dark:text-zinc-100">
            <School size={16} className="text-zinc-400" /> Institute Name <Tooltip text="Full name of your school, college, or training center" />
          </label>
          <input
            id="instituteName"
            type="text"
            value={config.instituteName}
            onChange={e => onChange({ instituteName: e.target.value })}
            placeholder="e.g. City College of Technology"
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:focus:border-white transition-all shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="instructorName" className="flex items-center gap-2 text-sm font-semibold mb-2 text-zinc-900 dark:text-zinc-100">
            <User2 size={16} className="text-zinc-400" /> Instructor Name <Tooltip text="Name of the faculty responsible for this class" />
          </label>
          <input
            id="instructorName"
            type="text"
            value={config.instructorName}
            onChange={e => onChange({ instructorName: e.target.value })}
            placeholder="e.g. Prof. John Smith"
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:focus:border-white transition-all shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="courseName" className="flex items-center gap-2 text-sm font-semibold mb-2 text-zinc-900 dark:text-zinc-100">
            <BookOpen size={16} className="text-zinc-400" /> Course / Subject <Tooltip text="Course or subject name, e.g. Mathematics, Python Programming" />
          </label>
          <input
            id="courseName"
            type="text"
            value={config.courseName}
            onChange={e => onChange({ courseName: e.target.value })}
            placeholder="e.g. Web Development"
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:focus:border-white transition-all shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="batchName" className="flex items-center gap-2 text-sm font-semibold mb-2 text-zinc-900 dark:text-zinc-100">
            <Layers size={16} className="text-zinc-400" /> Batch / Section <Tooltip text="Batch identifier, e.g. Batch-2024, Class 10-A, Section B" />
          </label>
          <input
            id="batchName"
            type="text"
            value={config.batchName}
            onChange={e => onChange({ batchName: e.target.value })}
            placeholder="e.g. Batch-2024-A"
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:focus:border-white transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 pt-4">
        {/* Header Layout */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            <LayoutTemplate size={16} className="text-zinc-400" /> Header Layout
          </label>
          <div className="grid grid-cols-3 gap-3">
            {layouts.map(l => (
              <button
                key={l.id}
                onClick={() => onChange({ headerLayout: l.id })}
                className={`p-3 rounded-xl text-center transition-all border outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-zinc-900 flex flex-col items-center justify-center gap-2 ${
                  config.headerLayout === l.id
                    ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white shadow-md'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {l.icon}
                <div className="text-[10px] font-bold uppercase tracking-wider">{l.label}</div>
              </button>
            ))}
          </div>
          
          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl p-4 shadow-inner">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Live Preview</p>
            <div className="min-h-[60px] opacity-80 pointer-events-none">
              <HeaderPreview config={config} />
            </div>
          </div>
        </div>

        {/* Extra Columns */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
            <Plus size={16} className="text-zinc-400" /> Extra Columns <Tooltip text="Add custom columns like Phone, Roll No, Department, Status to each student row" />
          </label>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCol}
              onChange={e => setNewCol(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addColumn()}
              placeholder="e.g. Phone No."
              className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 shadow-sm"
            />
            <button
              onClick={addColumn}
              className="px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-zinc-900 flex items-center gap-1"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {config.extraColumns.map(col => (
              <span
                key={col}
                className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg text-sm font-medium border border-zinc-200 dark:border-zinc-700"
              >
                {col}
                <button
                  onClick={() => removeColumn(col)}
                  className="p-0.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-md transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
            {config.extraColumns.length === 0 && (
              <span className="text-sm text-zinc-400 italic">No extra columns mapped yet.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function HeaderPreview({ config }: { config: AttendanceConfig }) {
  const { instituteName, courseName, batchName, instructorName, headerLayout } = config
  const name = instituteName || 'Institute Name'
  const course = courseName || 'Course Name'
  const batch = batchName || 'Batch'
  const instructor = instructorName || 'Instructor'

  if (headerLayout === 'centered') {
    return (
      <div className="text-center">
        <div className="text-sm font-black text-zinc-900 dark:text-white">{name}</div>
        <div className="text-xs text-zinc-500 font-medium mt-0.5">{course} • {batch} • {instructor}</div>
      </div>
    )
  }
  if (headerLayout === 'split') {
    return (
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm font-black text-zinc-900 dark:text-white">{name}</div>
          <div className="text-xs text-zinc-500 font-medium">{course}</div>
        </div>
        <div className="text-right text-xs text-zinc-500 font-medium">
          <div>{batch}</div>
          <div>{instructor}</div>
        </div>
      </div>
    )
  }
  return (
    <div className="border-l-2 border-zinc-900 dark:border-white pl-3">
      <div className="text-sm font-black text-zinc-900 dark:text-white">{name}</div>
      <div className="text-xs text-zinc-500 font-medium">{course} • {batch} • {instructor}</div>
    </div>
  )
}
