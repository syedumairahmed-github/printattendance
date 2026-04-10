import React, { useRef, useState } from 'react'
import type { AttendanceConfig, Student } from './types'
import { parseStudentText } from './utils'
import { Tooltip } from './Tooltip'

interface Props {
  config: AttendanceConfig
  onChange: (partial: Partial<AttendanceConfig>) => void
}

export function StudentImportStep({ config, onChange }: Props) {
  const [pasteText, setPasteText] = useState('')
  const [parseError, setParseError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleParse() {
    if (!pasteText.trim()) return
    try {
      const students = parseStudentText(pasteText, config.extraColumns)
      onChange({ students })
      setParseError('')
    } catch {
      setParseError('Failed to parse student data. Check the format.')
    }
  }

  async function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const { default: Papa } = await import('papaparse')
    Papa.parse(file, {
      complete: (result) => {
        const rows = result.data as string[][]
        const students: Student[] = rows
          .filter(r => r.some(c => c.trim()))
          .map((row, idx) => {
            const [id = '', name = '', fatherName = ''] = row.map(c => c.trim())
            const extraData: Record<string, string> = {}
            config.extraColumns.forEach((col, i) => {
              extraData[col] = row[3 + i]?.trim() || ''
            })
            return { id: id || String(idx + 1), name, fatherName, extraData }
          })
        onChange({ students })
        setParseError('')
      },
      error: () => setParseError('Failed to parse CSV file.'),
    })
  }

  function removeStudent(id: string) {
    onChange({ students: config.students.filter(s => s.id !== id) })
  }

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="pasteInput" className="block text-sm font-medium mb-1">
          Paste Student Data <Tooltip text="Paste tab-separated or pipe-separated data. Format: ID | Name | Father Name | (extra columns...)" />
        </label>
        <p className="text-xs text-gray-500 mb-2">Format: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">ID | Name | Father Name</code> (one student per line, tab or pipe separated)</p>
        <textarea
          id="pasteInput"
          value={pasteText}
          onChange={e => setPasteText(e.target.value)}
          placeholder={"1\tAli Ahmed\tMuhammad Ahmed\n2\tSara Khan\tKhan Baz\n3\tUmar Farooq\tFarooq Ahmed"}
          rows={8}
          className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-800 dark:border-gray-600 dark:text-white resize-y"
          aria-label="Paste student data"
        />
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={handleParse}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 dark:bg-white dark:text-black"
            aria-label="Parse pasted student data"
          >
            Import from Text
          </button>
          <span className="text-sm text-gray-400">or</span>
          <button
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 border rounded-lg text-sm font-medium hover:border-black dark:border-gray-600 dark:hover:border-white"
            aria-label="Upload CSV file"
          >
            Upload CSV
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCSV}
            aria-label="CSV file input"
          />
        </div>
        {parseError && <p className="text-red-500 text-sm mt-2" role="alert">{parseError}</p>}
      </div>

      {/* Student list */}
      {config.students.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">
              Imported Students <span className="ml-2 bg-black text-white dark:bg-white dark:text-black text-xs font-bold px-2 py-0.5 rounded-full">{config.students.length}</span>
            </p>
            <button
              onClick={() => onChange({ students: [] })}
              className="text-xs text-red-500 hover:underline"
              aria-label="Clear all students"
            >
              Clear All
            </button>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm" role="table" aria-label="Imported students list">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">ID</th>
                    <th className="text-left px-3 py-2 font-medium">Name</th>
                    <th className="text-left px-3 py-2 font-medium">Father Name</th>
                    {config.extraColumns.map(col => (
                      <th key={col} className="text-left px-3 py-2 font-medium">{col}</th>
                    ))}
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {config.students.map((s, idx) => (
                    <tr key={s.id} className={idx % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-800/50'}>
                      <td className="px-3 py-1.5 text-gray-500">{s.id}</td>
                      <td className="px-3 py-1.5 font-medium">{s.name}</td>
                      <td className="px-3 py-1.5">{s.fatherName}</td>
                      {config.extraColumns.map(col => (
                        <td key={col} className="px-3 py-1.5">{s.extraData[col] || '—'}</td>
                      ))}
                      <td className="px-3 py-1.5">
                        <button
                          onClick={() => removeStudent(s.id)}
                          className="text-red-400 hover:text-red-600 focus:outline-none"
                          aria-label={`Remove student ${s.name}`}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {config.students.length === 0 && (
        <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
          <p className="text-sm">No students imported yet.</p>
          <p className="text-xs mt-1">Paste student data above or upload a CSV file.</p>
        </div>
      )}
    </div>
  )
}
