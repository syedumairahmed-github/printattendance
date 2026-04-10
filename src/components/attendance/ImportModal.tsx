import React, { useState } from 'react'
import { FileUp, Link2, Download, AlertCircle, X, Search, FileSpreadsheet } from 'lucide-react'

interface ImportModalProps {
  onData: (headers: string[], data: any[][]) => void
  onClose: () => void
}

export function ImportModal({ onData, onClose }: ImportModalProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const { read, utils } = await import('xlsx')
      const buffer = await file.arrayBuffer()
      const wb = read(buffer)
      const ws = wb.Sheets[wb.SheetNames[0]]
      const json = utils.sheet_to_json(ws, { header: 1 }) as any[][]
      
      const headers = (json[0] || []).map(h => String(h).trim()).filter(Boolean)
      const data = json.slice(1).filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
      
      if (headers.length === 0) throw new Error('No headers found in file.')
      onData(headers, data)
    } catch (err: any) {
      setError(err.message || 'Failed to parse file.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchRemote() {
    if (!url.trim()) return
    setLoading(true)
    setError('')
    try {
      let fetchUrl = url
      // Google Sheets transform to CSV export
      if (url.includes('docs.google.com/spreadsheets')) {
        const match = url.match(/\/d\/(.+?)\//)
        if (match) {
          fetchUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`
        }
      }

      const response = await fetch(fetchUrl)
      if (!response.ok) throw new Error('Failed to fetch data from URL. Ensure the sheet is public or Published to Web.')
      const text = await response.text()
      
      const { default: Papa } = await import('papaparse')
      const result = Papa.parse(text, { header: false, skipEmptyLines: true })
      const json = result.data as string[][]
      
      const headers = (json[0] || []).map(h => String(h).trim()).filter(Boolean)
      const data = json.slice(1).filter(row => row.some(cell => cell !== ''))
      
      if (headers.length === 0) throw new Error('No data found at URL.')
      onData(headers, data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch spreadsheet.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-xl font-bold tracking-tight">Import Student Data</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* File Upload Option */}
          <div className="relative group">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={loading}
            />
            <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center group-hover:border-zinc-400 dark:group-hover:border-zinc-600 transition-all bg-zinc-50/50 dark:bg-zinc-950/50">
              <FileUp size={32} className="text-zinc-400 mb-4 group-hover:-translate-y-1 transition-transform" />
              <p className="text-sm font-semibold mb-1">Click to upload file</p>
              <p className="text-xs text-zinc-500">Supports CSV, XLSX, XLS</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <div className="h-px bg-zinc-100 dark:bg-zinc-800 flex-1" />
            <span className="text-[10px] uppercase font-black tracking-widest">Or from URL</span>
            <div className="h-px bg-zinc-100 dark:bg-zinc-800 flex-1" />
          </div>

          <div className="space-y-4">
            <p className="text-xs text-zinc-500 flex items-center gap-1.5 px-1">
               <Link2 size={12} /> Paste Google Sheet or Public Excel Link
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-mono placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                />
              </div>
              <button
                onClick={fetchRemote}
                disabled={loading || !url.trim()}
                className="px-6 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl text-sm font-semibold flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? <Download size={18} className="animate-bounce" /> : 'Fetch'}
              </button>
            </div>
            
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex gap-3">
              <FileSpreadsheet size={18} className="text-zinc-400 shrink-0" />
              <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                Note: Google Sheets must have "Anyone with the link can view" enabled OR be "Published to the Web". 
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-100 dark:border-rose-900/30 flex gap-3 animate-in shake duration-500">
              <AlertCircle size={18} className="text-rose-500 shrink-0" />
              <p className="text-xs text-rose-700 dark:text-rose-400">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
