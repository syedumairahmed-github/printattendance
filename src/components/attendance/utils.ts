import type { AttendanceConfig, Student } from './types'

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

export function getMonthName(month: number) {
  return MONTH_NAMES[month]
}

export function getWorkingDays(year: number, month: number, holidays: number[]): number[] {
  const days: number[] = []
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month, d).getDay()
    if (dow !== 0 && dow !== 6 && !holidays.includes(d)) {
      days.push(d)
    }
  }
  return days
}

export function getSmartFilename(cfg: AttendanceConfig, ext: string): string {
  const parts = [
    cfg.instituteName || 'Institute',
    cfg.courseName || 'Course',
    cfg.batchName || 'Batch',
    getMonthName(cfg.month),
    cfg.year,
  ].map(p => String(p).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, ''))
  return `${parts.join('-')}.${ext}`
}

export function parseStudentText(text: string, extraColumns: string[]): Student[] {
  const lines = text.trim().split('\n').filter(l => l.trim())
  return lines.map((line, idx) => {
    const sep = line.includes('\t') ? '\t' : '|'
    const parts = line.split(sep).map(p => p.trim())
    const [id = '', name = '', fatherName = ''] = parts
    const extraData: Record<string, string> = {}
    extraColumns.forEach((col, i) => {
      extraData[col] = parts[3 + i] || ''
    })
    return { id: id || String(idx + 1), name, fatherName, extraData }
  })
}

export function saveToLocalStorage(cfg: AttendanceConfig) {
  try {
    localStorage.setItem('attendanceConfig', JSON.stringify(cfg))
  } catch {}
}

export function loadFromLocalStorage(): AttendanceConfig | null {
  try {
    const raw = localStorage.getItem('attendanceConfig')
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}
