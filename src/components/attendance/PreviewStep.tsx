import React, { memo, useMemo, useState } from 'react'
import type { AttendanceConfig } from './types'
import { getWorkingDays, getMonthName, getSmartFilename } from './utils'
import { Tooltip } from './Tooltip'
import { FileSpreadsheet, FileText, Printer, FileDown, ShieldAlert } from 'lucide-react'

interface Props {
  config: AttendanceConfig
  onChange: (partial: Partial<AttendanceConfig>) => void
}

const WATERMARK_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'DRAFT', label: 'DRAFT' },
  { value: 'CONFIDENTIAL', label: 'CONFIDENTIAL' },
  { value: 'SAMPLE', label: 'SAMPLE' },
]

export const PreviewStep = memo(function PreviewStep({ config, onChange }: Props) {
  const [exporting, setExporting] = useState<string | null>(null)
  const workingDays = useMemo(() => getWorkingDays(config.year, config.month, config.holidays), [config.year, config.month, config.holidays])

  async function exportExcel() {
    setExporting('excel')
    try {
      const { utils, writeFile } = await import('xlsx')
      const wb = utils.book_new()
      const headers = ['S.No', 'Student ID', 'Name', "Father's Name", ...config.extraColumns, ...workingDays.map(d => `${d}/${config.month + 1}`), 'Total']
      const rows = config.students.map((s, idx) => [
        idx + 1, s.id, s.name, s.fatherName,
        ...config.extraColumns.map(c => s.extraData[c] || ''),
        ...workingDays.map(() => ''),
        workingDays.length,
      ])
      const ws = utils.aoa_to_sheet([
        [`${config.instituteName} — Attendance Register`],
        [`Course: ${config.courseName} | Batch: ${config.batchName} | Instructor: ${config.instructorName}`],
        [`Month: ${getMonthName(config.month)} ${config.year} | Working Days: ${workingDays.length}`],
        [],
        headers,
        ...rows,
        ['', '', 'Total Working Days', '', ...config.extraColumns.map(() => ''), ...workingDays.map(() => ''), workingDays.length],
      ])
      ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }]
      utils.book_append_sheet(wb, ws, `${getMonthName(config.month)} ${config.year}`)
      writeFile(wb, getSmartFilename(config, 'xlsx'))
    } finally {
      setExporting(null)
    }
  }

  async function exportPDF() {
    setExporting('pdf')
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

      const headers = ['#', 'ID', 'Name', "Father's Name", ...config.extraColumns, ...workingDays.map(d => String(d)), 'Total']
      const rows = config.students.map((s, idx) => [
        String(idx + 1), s.id, s.name, s.fatherName,
        ...config.extraColumns.map(c => s.extraData[c] || ''),
        ...workingDays.map(() => ''),
        String(workingDays.length),
      ])
      rows.push(['', '', 'Total Working Days', '', ...config.extraColumns.map(() => ''), ...workingDays.map(() => ''), String(workingDays.length)])

      // Header
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(config.instituteName || 'Institute', 148, 14, { align: 'center' })
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`Course: ${config.courseName || '—'} | Batch: ${config.batchName || '—'} | Instructor: ${config.instructorName || '—'}`, 148, 20, { align: 'center' })
      doc.text(`Attendance Register — ${getMonthName(config.month)} ${config.year} | Working Days: ${workingDays.length}`, 148, 25, { align: 'center' })

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 30,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1.5 },
        headStyles: { fillColor: [24, 24, 27], textColor: 255, fontStyle: 'bold' }, // zinc-900
        columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 12 }, 2: { cellWidth: 30 }, 3: { cellWidth: 30 } },
      })

      // Footer
      const pageHeight = doc.internal.pageSize.getHeight()
      doc.setFontSize(8)
      doc.text(`Instructor Signature: _______________________    Date: _____________`, 148, pageHeight - 10, { align: 'center' })

      // Watermark
      if (config.watermark) {
        doc.setFontSize(60)
        doc.setTextColor(200, 200, 200)
        doc.setFont('helvetica', 'bold')
        doc.text(config.watermark, 148, 110, { align: 'center', angle: 45 })
        doc.setTextColor(0, 0, 0)
      }

      doc.save(getSmartFilename(config, 'pdf'))
    } finally {
      setExporting(null)
    }
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Export Options */}
      <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 print:hidden flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="w-full md:w-auto flex-1">
          <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-zinc-900 dark:text-zinc-100">
            <ShieldAlert size={16} className="text-zinc-400" /> Document Watermark (PDF)
          </label>
          <select
            value={config.watermark}
            onChange={e => onChange({ watermark: e.target.value as any })}
            className="w-full md:w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 shadow-sm appearance-none cursor-pointer"
            aria-label="Watermark option"
          >
            {WATERMARK_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-auto flex flex-wrap gap-3 mt-4 md:mt-0">
          <button
            onClick={exportExcel}
            disabled={!!exporting || config.students.length === 0}
            className="flex-1 md:flex-none px-5 py-2.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-zinc-900 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {exporting === 'excel' ? <FileDown size={18} className="animate-bounce" /> : <FileSpreadsheet size={18} />} Excel
          </button>
          
          <button
            onClick={exportPDF}
            disabled={!!exporting || config.students.length === 0}
            className="flex-1 md:flex-none px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 hover:shadow-lg hover:-translate-y-0.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-rose-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {exporting === 'pdf' ? <FileDown size={18} className="animate-bounce" /> : <FileText size={18} />} PDF
          </button>
          
          <button
            onClick={handlePrint}
            disabled={config.students.length === 0}
            className="flex-1 md:flex-none px-5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm font-semibold hover:border-zinc-400 dark:hover:border-zinc-600 transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-zinc-900 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Printer size={18} className="text-zinc-500" /> Print
          </button>
        </div>
      </div>

      {/* Preview Table */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-x-auto bg-white dark:bg-zinc-950 shadow-sm print:border-0 print:shadow-none" id="print-area">
        <AttendanceTable config={config} workingDays={workingDays} />
      </div>

      {config.students.length === 0 && (
        <div className="text-center py-12 text-zinc-500 text-sm bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 print:hidden">
          No students to preview. Go back to step 3 to import students.
        </div>
      )}
    </div>
  )
})

const AttendanceTable = memo(function AttendanceTable({ config, workingDays }: { config: AttendanceConfig; workingDays: number[] }) {
  const { instituteName, courseName, batchName, instructorName, month, year, headerLayout, extraColumns, students } = config

  return (
    <div className="min-w-max">
      {/* Sheet Header */}
      <div className={`p-6 border-b border-zinc-200 dark:border-zinc-800 print:border-b-2 print:border-zinc-900 ${
        headerLayout === 'centered' ? 'text-center' : headerLayout === 'split' ? 'flex justify-between items-start' : 'pl-6 border-l-4 border-zinc-900 dark:border-white'
      }`}>
        {headerLayout === 'centered' && (
          <>
            <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">{instituteName || 'Institute Name'}</h2>
            <p className="text-xs text-zinc-500 font-semibold mt-1 uppercase tracking-wider">{courseName} • {batchName} • {instructorName}</p>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-2">Attendance Register — {getMonthName(month)} {year}</p>
          </>
        )}
        {headerLayout === 'split' && (
          <>
            <div>
              <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">{instituteName || 'Institute Name'}</h2>
              <p className="text-xs text-zinc-500 font-semibold mt-1 uppercase tracking-wider">{courseName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500 font-semibold mt-1 uppercase tracking-wider">{batchName} • {instructorName}</p>
              <p className="font-black text-zinc-900 dark:text-zinc-100 mt-2">Register: {getMonthName(month)} {year}</p>
            </div>
          </>
        )}
        {headerLayout === 'boxed-left' && (
          <>
            <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">{instituteName || 'Institute Name'}</h2>
            <p className="text-xs text-zinc-500 font-semibold mt-1 uppercase tracking-wider">{courseName} • {batchName} • {instructorName} • {getMonthName(month)} {year}</p>
          </>
        )}
      </div>
      {/* Table */}
      <table className="text-xs border-collapse w-full relative" role="table">
        <thead>
          <tr className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-b border-zinc-900 dark:border-white">
            <th className="border-r border-zinc-700 dark:border-zinc-200 px-3 py-2 font-semibold uppercase tracking-wider whitespace-nowrap" scope="col">#</th>
            <th className="border-r border-zinc-700 dark:border-zinc-200 px-3 py-2 font-semibold uppercase tracking-wider whitespace-nowrap" scope="col">ID</th>
            <th className="border-r border-zinc-700 dark:border-zinc-200 px-3 py-2 font-semibold uppercase tracking-wider whitespace-nowrap min-w-[140px] text-left" scope="col">Student Name</th>
            <th className="border-r border-zinc-700 dark:border-zinc-200 px-3 py-2 font-semibold uppercase tracking-wider whitespace-nowrap min-w-[140px] text-left" scope="col">Father's Name</th>
            {extraColumns.map(col => (
              <th key={col} className="border-r border-zinc-700 dark:border-zinc-200 px-3 py-2 font-semibold uppercase tracking-wider whitespace-nowrap text-left" scope="col">{col}</th>
            ))}
            {workingDays.map(d => (
              <th key={d} className="border-r border-zinc-700 dark:border-zinc-200 px-1 py-2 font-bold w-6 text-center" scope="col">{d}</th>
            ))}
            <th className="px-3 py-2 font-semibold uppercase tracking-wider whitespace-nowrap" scope="col">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {students.map((s, idx) => (
            <tr key={s.id} className={idx % 2 === 0 ? 'bg-white dark:bg-zinc-950' : 'bg-zinc-50/80 dark:bg-zinc-900/50'}>
              <td className="border-r border-zinc-200 dark:border-zinc-800 px-3 py-2 text-center font-mono text-[10px] text-zinc-500">{idx + 1}</td>
              <td className="border-r border-zinc-200 dark:border-zinc-800 px-3 py-2 text-center font-mono text-[10px] text-zinc-600 dark:text-zinc-400">{s.id}</td>
              <td className="border-r border-zinc-200 dark:border-zinc-800 px-3 py-2 font-medium text-zinc-900 dark:text-zinc-100">{s.name}</td>
              <td className="border-r border-zinc-200 dark:border-zinc-800 px-3 py-2 text-zinc-600 dark:text-zinc-400">{s.fatherName}</td>
              {extraColumns.map(col => (
                <td key={col} className="border-r border-zinc-200 dark:border-zinc-800 px-3 py-2 text-zinc-600 dark:text-zinc-400">{s.extraData[col] || ''}</td>
              ))}
              {workingDays.map(d => (
                <td key={d} className="border-r border-zinc-200 dark:border-zinc-800 p-0 text-center relative group max-w-6">
                  {/* Empty cell for marking */}
                </td>
              ))}
              <td className="px-3 py-2 text-center font-black text-zinc-900 dark:text-zinc-100">{workingDays.length}</td>
            </tr>
          ))}
          {/* Summary Row */}
          {students.length > 0 && (
            <tr className="bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-white border-t-2 border-zinc-900 dark:border-zinc-700">
              <td colSpan={4 + extraColumns.length} className="border-r border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-right text-[10px] uppercase tracking-widest font-bold">Total Working Days →</td>
              {workingDays.map(d => (
                <td key={d} className="border-r border-zinc-300 dark:border-zinc-700 p-0 text-center text-[8px] text-zinc-400">·</td>
              ))}
              <td className="px-3 py-2.5 text-center font-black">{workingDays.length}</td>
            </tr>
          )}
        </tbody>
      </table>
      {/* Signature Footer */}
      <div className="flex justify-between px-8 py-8 text-xs font-semibold text-zinc-500 uppercase tracking-widest print:block mt-8">
        <span>Instructor Signature: <span className="inline-block w-48 border-b border-zinc-300 dark:border-zinc-700"></span></span>
        <span>Date: <span className="inline-block w-32 border-b border-zinc-300 dark:border-zinc-700"></span></span>
      </div>
    </div>
  )
})
