import React, { useRef, useState } from 'react'
import type { AttendanceConfig, Student } from './types'
import { parseStudentText } from './utils'
import { Tooltip } from './Tooltip'
import { Users, ClipboardPaste, X, AlertCircle, FilePlus2, FileText } from 'lucide-react'
import { ImportModal } from './ImportModal'
import { ColumnMapper } from './ColumnMapper'

interface Props {
  config: AttendanceConfig
  onChange: (partial: Partial<AttendanceConfig>) => void
}

export function StudentImportStep({ config, onChange }: Props) {
  const [pasteText, setPasteText] = useState('')
  const [parseError, setParseError] = useState('')
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importSession, setImportSession] = useState<{ headers: string[], data: any[][] } | null>(null)

  function handleParse() {
    if (!pasteText.trim()) return
    try {
      const students = parseStudentText(pasteText, config.extraColumns)
      onChange({ students })
      setPasteText('')
      setParseError('')
    } catch {
      setParseError('Failed to parse student data. Check the format.')
    }
  }

  function handleImportData(headers: string[], data: any[][]) {
    setImportSession({ headers, data })
    setShowImportDialog(false)
  }

  function handleMapping(mapping: Record<string, string>) {
    // Process the session data into Student objects
    const students: Student[] = importSession!.data.map((row, idx) => {
      const idIdx = importSession!.headers.indexOf(mapping.id)
      const nameIdx = importSession!.headers.indexOf(mapping.name)
      const fatherIdx = importSession!.headers.indexOf(mapping.fatherName)

      const id = String(row[idIdx] || '').trim()
      const name = String(row[nameIdx] || '').trim()
      const fatherName = String(row[fatherIdx] || '').trim()

      const extraData: Record<string, string> = {}
      config.extraColumns.forEach(col => {
        const colIdx = importSession!.headers.indexOf(col)
        if (colIdx !== -1) extraData[col] = String(row[colIdx] || '').trim()
      })

      return {
        id: id || String(config.students.length + idx + 1),
        name,
        fatherName,
        extraData
      }
    }).filter(s => s.name) // Ensure we have at least a name

    onChange({ students: [...config.students, ...students] })
    setImportSession(null)
  }

  function removeStudent(id: string) {
    onChange({ students: config.students.filter(s => s.id !== id) })
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[350px]">
      <div>
        <label htmlFor="pasteInput" className="flex items-center gap-2 text-sm font-semibold mb-2 text-zinc-900 dark:text-zinc-100">
          <Users size={16} className="text-zinc-400" /> Student Data <Tooltip text="Paste tab-separated or pipe-separated data. Format: ID | Name | Father Name | (extra columns...)" />
        </label>
        <p className="text-xs text-zinc-500 mb-3 flex items-center gap-1">
          <FileText size={12} /> Format: <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono text-[10px]">ID | Name | Father Name</code> (one student per line)
        </p>
        <div className="relative group">
          <textarea
            id="pasteInput"
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            placeholder={"1\tAli Ahmed\tMuhammad Ahmed\n2\tSara Khan\tKhan Baz\n3\tUmar Farooq\tFarooq Ahmed"}
            rows={6}
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 shadow-inner resize-y transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            aria-label="Paste student data"
          />
          {!pasteText && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-10 transition-opacity">
              <ClipboardPaste size={64} />
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <button
            onClick={handleParse}
            disabled={!pasteText.trim()}
            className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-zinc-900 flex items-center gap-2 disabled:opacity-50"
          >
            <ClipboardPaste size={16} /> Mark as Parsed
          </button>
          <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider text-[10px]">or</span>
          <button
            onClick={() => setShowImportDialog(true)}
            className="px-5 py-2.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-zinc-900 flex items-center gap-2 shadow-sm"
          >
            <FilePlus2 size={16} /> Import from File or URL
          </button>
        </div>

        {showImportDialog && (
          <ImportModal 
            onData={handleImportData} 
            onClose={() => setShowImportDialog(false)} 
          />
        )}

        {importSession && (
          <div className="fixed inset-0 z-[101] bg-white dark:bg-zinc-950 p-8 flex flex-col animate-in fade-in duration-300">
            <div className="max-w-3xl mx-auto w-full">
              <ColumnMapper 
                headers={importSession.headers} 
                data={importSession.data} 
                onMap={handleMapping} 
                onCancel={() => setImportSession(null)} 
              />
            </div>
          </div>
        )}

        {parseError && (
          <div className="flex items-center gap-2 text-rose-500 text-sm mt-4 bg-rose-50 dark:bg-rose-950 p-3 rounded-lg border border-rose-200 dark:border-rose-900/50" role="alert">
            <AlertCircle size={16} /> {parseError}
          </div>
        )}
      </div>

      {/* Student list */}
      {config.students.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              Imported List 
              <span className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                {config.students.length}
              </span>
            </p>
            <button
              onClick={() => {
                if(window.confirm('Clear all students?')) onChange({ students: [] })
              }}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded px-1"
            >
              Clear All
            </button>
          </div>
          
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
            <div className="max-h-72 overflow-y-auto hide-scrollbar">
              <table className="w-full text-sm text-left" role="table">
                <thead className="bg-zinc-50 dark:bg-zinc-900 sticky top-0 z-10 box-border border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 font-semibold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 font-semibold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">Father Name</th>
                    {config.extraColumns.map(col => (
                      <th key={col} className="px-4 py-3 font-semibold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">{col}</th>
                    ))}
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                  {config.students.map((s) => (
                    <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group">
                      <td className="px-4 py-2.5 text-zinc-500 font-mono text-xs">{s.id}</td>
                      <td className="px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-100">{s.name}</td>
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{s.fatherName}</td>
                      {config.extraColumns.map(col => (
                        <td key={col} className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{s.extraData[col] || '—'}</td>
                      ))}
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => removeStudent(s.id)}
                          className="p-1 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded opacity-0 group-hover:opacity-100 transition-all outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-rose-500"
                          aria-label={`Remove student ${s.name}`}
                        >
                          <X size={14} />
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
        <div className="flex flex-col items-center justify-center py-12 text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/50">
          <Users size={32} className="mb-3 opacity-20" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">No students found</p>
          <p className="text-xs mt-1">Paste data or upload a CSV to populate the register.</p>
        </div>
      )}
    </div>
  )
}
