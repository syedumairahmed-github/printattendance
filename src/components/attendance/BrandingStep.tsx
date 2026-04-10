import React, { useState } from 'react'
import type { AttendanceConfig, HeaderLayout } from './types'
import { Tooltip } from './Tooltip'

interface Props {
  config: AttendanceConfig
  onChange: (partial: Partial<AttendanceConfig>) => void
}

const layouts: { id: HeaderLayout; label: string; desc: string }[] = [
  { id: 'centered', label: 'Centered', desc: 'Logo and text centered' },
  { id: 'split', label: 'Split View', desc: 'Name left, details right' },
  { id: 'boxed-left', label: 'Boxed Left', desc: 'Boxed left-aligned header' },
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
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="instituteName" className="block text-sm font-medium mb-1">
            Institute Name <Tooltip text="Full name of your school, college, or training center" />
          </label>
          <input
            id="instituteName"
            type="text"
            value={config.instituteName}
            onChange={e => onChange({ instituteName: e.target.value })}
            placeholder="e.g. City College of Technology"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            aria-label="Institute name"
          />
        </div>
        <div>
          <label htmlFor="instructorName" className="block text-sm font-medium mb-1">
            Instructor / Teacher Name <Tooltip text="Name of the faculty responsible for this class" />
          </label>
          <input
            id="instructorName"
            type="text"
            value={config.instructorName}
            onChange={e => onChange({ instructorName: e.target.value })}
            placeholder="e.g. Prof. John Smith"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            aria-label="Instructor name"
          />
        </div>
        <div>
          <label htmlFor="courseName" className="block text-sm font-medium mb-1">
            Course / Subject <Tooltip text="Course or subject name, e.g. Mathematics, Python Programming" />
          </label>
          <input
            id="courseName"
            type="text"
            value={config.courseName}
            onChange={e => onChange({ courseName: e.target.value })}
            placeholder="e.g. Web Development"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            aria-label="Course name"
          />
        </div>
        <div>
          <label htmlFor="batchName" className="block text-sm font-medium mb-1">
            Batch / Class / Section <Tooltip text="Batch identifier, e.g. Batch-2024, Class 10-A, Section B" />
          </label>
          <input
            id="batchName"
            type="text"
            value={config.batchName}
            onChange={e => onChange({ batchName: e.target.value })}
            placeholder="e.g. Batch-2024-A"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            aria-label="Batch name"
          />
        </div>
      </div>

      {/* Header Layout */}
      <div>
        <p className="text-sm font-medium mb-2">
          Header Layout <Tooltip text="Choose how the institute name and details appear on the printed sheet" />
        </p>
        <div className="grid grid-cols-3 gap-3">
          {layouts.map(l => (
            <button
              key={l.id}
              onClick={() => onChange({ headerLayout: l.id })}
              aria-pressed={config.headerLayout === l.id}
              className={`p-3 border rounded-lg text-left transition-all ${
                config.headerLayout === l.id
                  ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                  : 'hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-400'
              }`}
            >
              <div className="text-xs font-semibold">{l.label}</div>
              <div className="text-xs opacity-70 mt-0.5">{l.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Live Header Preview */}
      <div>
        <p className="text-sm font-medium mb-2">Live Preview</p>
        <div className="border rounded-lg p-4 bg-white dark:bg-gray-900 min-h-[80px]">
          <HeaderPreview config={config} />
        </div>
      </div>

      {/* Extra Columns */}
      <div>
        <p className="text-sm font-medium mb-2">
          Extra Columns <Tooltip text="Add custom columns like Phone, Roll No, Department, Status to each student row" />
        </p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newCol}
            onChange={e => setNewCol(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addColumn()}
            placeholder="e.g. Phone, Roll No, Status"
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            aria-label="New extra column name"
          />
          <button
            onClick={addColumn}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            aria-label="Add column"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2" role="list" aria-label="Extra columns">
          {config.extraColumns.map(col => (
            <span
              key={col}
              role="listitem"
              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
            >
              {col}
              <button
                onClick={() => removeColumn(col)}
                className="ml-1 text-gray-500 hover:text-black dark:hover:text-white focus:outline-none"
                aria-label={`Remove ${col} column`}
              >
                ×
              </button>
            </span>
          ))}
          {config.extraColumns.length === 0 && (
            <span className="text-sm text-gray-400">No extra columns added</span>
          )}
        </div>
      </div>
    </div>
  )
}

function HeaderPreview({ config }: { config: AttendanceConfig }) {
  const { instituteName, courseName, batchName, instructorName, headerLayout } = config
  const name = instituteName || 'Your Institute Name'
  const course = courseName || 'Course Name'
  const batch = batchName || 'Batch'
  const instructor = instructorName || 'Instructor'

  if (headerLayout === 'centered') {
    return (
      <div className="text-center">
        <div className="text-base font-bold">{name}</div>
        <div className="text-xs text-gray-500 mt-1">{course} | {batch} | {instructor}</div>
      </div>
    )
  }
  if (headerLayout === 'split') {
    return (
      <div className="flex justify-between items-start">
        <div>
          <div className="text-base font-bold">{name}</div>
          <div className="text-xs text-gray-500">{course}</div>
        </div>
        <div className="text-right text-xs text-gray-500">
          <div>{batch}</div>
          <div>{instructor}</div>
        </div>
      </div>
    )
  }
  return (
    <div className="border-l-4 border-black dark:border-white pl-3">
      <div className="text-base font-bold">{name}</div>
      <div className="text-xs text-gray-500">{course} · {batch} · {instructor}</div>
    </div>
  )
}
