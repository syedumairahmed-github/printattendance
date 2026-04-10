import React, { memo, useMemo, useState } from 'react'
import type { AttendanceConfig } from './types'
import { getWorkingDays, getMonthName, getSmartFilename } from './utils'
import { Tooltip } from './Tooltip'

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
        headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold' },
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
    <div className="space-y-6">
      {/* Export Options */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <label className="text-sm font-medium mr-2">
            Watermark <Tooltip text="Add a diagonal watermark text on PDF export" />
          </label>
          <select
            value={config.watermark}
            onChange={e => onChange({ watermark: e.target.value as any })}
            className="border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            aria-label="Watermark option"
          >
            {WATERMARK_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1" />
        <button
          onClick={exportExcel}
          disabled={!!exporting}
          className="px-4 py-2 border-2 border-black dark:border-white rounded-lg text-sm font-semibold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all disabled:opacity-50"
          aria-label="Export to Excel"
        >
          {exporting === 'excel' ? 'Generating…' : '⬇ Export Excel'}
        </button>
        <button
          onClick={exportPDF}
          disabled={!!exporting}
          className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-all disabled:opacity-50"
          aria-label="Export to PDF"
        >
          {exporting === 'pdf' ? 'Generating…' : '⬇ Export PDF'}
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 border rounded-lg text-sm font-medium hover:border-black dark:border-gray-600 dark:hover:border-white"
          aria-label="Print attendance sheet"
        >
          🖨 Print
        </button>
      </div>

      {/* Preview Table */}
      <div className="border rounded-lg overflow-x-auto print:border-0" id="print-area">
        <AttendanceTable config={config} workingDays={workingDays} />
      </div>

      {config.students.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-4">No students to preview. Go back and import students.</p>
      )}
    </div>
  )
})

const AttendanceTable = memo(function AttendanceTable({ config, workingDays }: { config: AttendanceConfig; workingDays: number[] }) {
  const { instituteName, courseName, batchName, instructorName, month, year, headerLayout, extraColumns, students } = config

  return (
    <div className="min-w-max">
      {/* Sheet Header */}
      <div className={`p-4 border-b print:border-b ${headerLayout === 'centered' ? 'text-center' : headerLayout === 'split' ? 'flex justify-between items-start px-6' : 'pl-6 border-l-4 border-black'}`}>
        {headerLayout === 'centered' && (
          <>
            <h2 className="text-lg font-bold">{instituteName || 'Institute Name'}</h2>
            <p className="text-xs text-gray-500">{courseName} | {batchName} | {instructorName}</p>
            <p className="text-xs font-medium mt-1">Attendance Register — {getMonthName(month)} {year}</p>
          </>
        )}
        {headerLayout === 'split' && (
          <>
            <div>
              <h2 className="text-lg font-bold">{instituteName || 'Institute Name'}</h2>
              <p className="text-xs text-gray-500">{courseName}</p>
            </div>
            <div className="text-right text-xs text-gray-500">
              <p>{batchName}</p>
              <p>{instructorName}</p>
              <p className="font-medium text-black dark:text-white">{getMonthName(month)} {year}</p>
            </div>
          </>
        )}
        {headerLayout === 'boxed-left' && (
          <>
            <h2 className="text-lg font-bold">{instituteName || 'Institute Name'}</h2>
            <p className="text-xs text-gray-500">{courseName} · {batchName} · {instructorName} · {getMonthName(month)} {year}</p>
          </>
        )}
      </div>
      {/* Table */}
      <table className="text-xs border-collapse w-full" role="table" aria-label="Attendance sheet preview">
        <thead>
          <tr className="bg-black text-white dark:bg-white dark:text-black">
            <th className="border border-gray-300 px-2 py-1.5 whitespace-nowrap" scope="col">#</th>
            <th className="border border-gray-300 px-2 py-1.5 whitespace-nowrap" scope="col">Student ID</th>
            <th className="border border-gray-300 px-2 py-1.5 whitespace-nowrap min-w-[120px]" scope="col">Student Name</th>
            <th className="border border-gray-300 px-2 py-1.5 whitespace-nowrap min-w-[120px]" scope="col">Father's Name</th>
            {extraColumns.map(col => (
              <th key={col} className="border border-gray-300 px-2 py-1.5 whitespace-nowrap" scope="col">{col}</th>
            ))}
            {workingDays.map(d => (
              <th key={d} className="border border-gray-300 px-1.5 py-1.5 w-7 text-center" scope="col">{d}</th>
            ))}
            <th className="border border-gray-300 px-2 py-1.5 whitespace-nowrap" scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, idx) => (
            <tr key={s.id} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
              <td className="border border-gray-200 px-2 py-1.5 text-center text-gray-500">{idx + 1}</td>
              <td className="border border-gray-200 px-2 py-1.5 text-center">{s.id}</td>
              <td className="border border-gray-200 px-2 py-1.5 font-medium">{s.name}</td>
              <td className="border border-gray-200 px-2 py-1.5">{s.fatherName}</td>
              {extraColumns.map(col => (
                <td key={col} className="border border-gray-200 px-2 py-1.5">{s.extraData[col] || ''}</td>
              ))}
              {workingDays.map(d => (
                <td key={d} className="border border-gray-200 w-7 h-7 text-center"></td>
              ))}
              <td className="border border-gray-200 px-2 py-1.5 text-center font-bold">{workingDays.length}</td>
            </tr>
          ))}
          {/* Summary Row */}
          {students.length > 0 && (
            <tr className="bg-black text-white dark:bg-white dark:text-black font-bold">
              <td colSpan={4 + extraColumns.length} className="border border-gray-300 px-2 py-1.5 text-right text-xs">Total Working Days →</td>
              {workingDays.map(d => (
                <td key={d} className="border border-gray-300 w-7 h-7 text-center text-xs">·</td>
              ))}
              <td className="border border-gray-300 px-2 py-1.5 text-center">{workingDays.length}</td>
            </tr>
          )}
        </tbody>
      </table>
      {/* Signature Footer */}
      <div className="flex justify-between px-6 py-4 text-xs text-gray-500 border-t print:block">
        <span>Instructor Signature: _____________________________</span>
        <span>Date: ___________________</span>
      </div>
    </div>
  )
})
