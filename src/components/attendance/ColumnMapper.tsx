import React, { useState, useEffect } from 'react'
import { Check, ChevronRight, AlertCircle, Columns } from 'lucide-react'

interface ColumnMapperProps {
  headers: string[]
  data: any[][]
  onMap: (mapping: Record<string, string>) => void
  onCancel: () => void
}

export function ColumnMapper({ headers, data, onMap, onCancel }: ColumnMapperProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({
    id: '',
    name: '',
    fatherName: ''
  })

  // Try to auto-guess mapping based on header names
  useEffect(() => {
    const newMapping = { ...mapping }
    headers.forEach(h => {
      const lower = h.toLowerCase().trim()
      if (lower.includes('id') || lower.includes('roll') || lower.includes('s.no')) newMapping.id = h
      if (lower.includes('name') && !lower.includes('father')) newMapping.name = h
      if (lower.includes('father') || lower.includes('parent')) newMapping.fatherName = h
    })
    setMapping(newMapping)
  }, [headers])

  const isValid = mapping.id && mapping.name && mapping.fatherName

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
          <Columns size={20} className="text-zinc-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Map Your Columns</h3>
          <p className="text-sm text-zinc-500">Tell us which column is which.</p>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { key: 'id', label: 'Student ID / Roll No', required: true },
          { key: 'name', label: 'Student Name', required: true },
          { key: 'fatherName', label: "Father's Name", required: true },
        ].map(field => (
          <div key={field.key} className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {field.label} {field.required && <span className="text-rose-500">*</span>}
            </label>
            <select
              value={mapping[field.key]}
              onChange={(e) => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
              className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all md:w-64"
            >
              <option value="">Select Column...</option>
              {headers.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex gap-3">
        <AlertCircle size={18} className="text-amber-500 shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
          <strong>Pro-tip:</strong> We've analyzed the first few rows of your sheet. Make sure the headers above correctly match your data preview below.
        </p>
      </div>

      {/* Preview Table (Small) */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="max-h-32 overflow-y-auto overflow-x-auto hide-scrollbar bg-white dark:bg-zinc-950">
          <table className="w-full text-[10px] text-left">
            <thead className="bg-zinc-100 dark:bg-zinc-900">
              <tr>
                {headers.map(h => (
                  <th key={h} className="px-3 py-2 font-bold text-zinc-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.slice(0, 3).map((row, i) => (
                <tr key={i}>
                  {headers.map((h, j) => (
                    <td key={j} className="px-3 py-2 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{String(row[j] || '—')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <button
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onMap(mapping)}
          disabled={!isValid}
          className="px-8 py-2.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          Confirm Mapping <Check size={16} />
        </button>
      </div>
    </div>
  )
}
