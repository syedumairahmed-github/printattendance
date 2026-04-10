import React, { useState } from 'react'
import type { AttendanceConfig } from './types'
import { getWorkingDays, getMonthName } from './utils'
import { Tooltip } from './Tooltip'
import { CalendarIcon, Globe } from 'lucide-react'

interface Props {
  config: AttendanceConfig
  onChange: (partial: Partial<AttendanceConfig>) => void
}

const MONTH_NAMES = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec'
]

const currentYear = new Date().getFullYear()
const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2]

// Simple predefined region holidays mapping (approximate for demo purposes)
const REGION_HOLIDAYS: Record<string, { label: string; rules: (m: number, y: number) => number[] }> = {
  US: { label: 'US Holidays (Approx)', rules: (m) => m === 0 ? [1] : m === 6 ? [4] : m === 11 ? [25] : [] },
  UK: { label: 'UK Holidays (Approx)', rules: (m) => m === 0 ? [1] : m === 11 ? [25, 26] : [] },
  IN: { label: 'India Holidays (Approx)', rules: (m) => m === 0 ? [26] : m === 7 ? [15] : m === 9 ? [2] : [] },
}

export function TimelineStep({ config, onChange }: Props) {
  const workingDays = getWorkingDays(config.year, config.month, config.holidays)
  const daysInMonth = new Date(config.year, config.month + 1, 0).getDate()
  const [selectedRegion, setSelectedRegion] = useState('')

  function toggleHoliday(day: number) {
    const dow = new Date(config.year, config.month, day).getDay()
    if (dow === 0 || dow === 6) return // can't toggle weekends
    const holidays = config.holidays.includes(day)
      ? config.holidays.filter(h => h !== day)
      : [...config.holidays, day]
    onChange({ holidays: holidays.sort((a,b) => a-b) })
  }

  function applyRegionHolidays(regionCode: string) {
    setSelectedRegion(regionCode)
    if (!regionCode || !REGION_HOLIDAYS[regionCode]) return
    const regionDays = REGION_HOLIDAYS[regionCode].rules(config.month, config.year)
    // Merge without duplicates
    const newHolidays = Array.from(new Set([...config.holidays, ...regionDays])).sort((a,b) => a-b)
    onChange({ holidays: newHolidays })
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Year Selector */}
        <div className="flex-1">
          <label className="flex items-center gap-2 text-sm font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
            <CalendarIcon size={16} className="text-zinc-400" /> Academic Year <Tooltip text="Select the academic or calendar year" />
          </label>
          <div className="flex gap-2 flex-wrap">
            {years.map(y => (
              <button
                key={y}
                onClick={() => onChange({ year: y, holidays: [] })}
                aria-pressed={config.year === y}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-zinc-900 ${
                  config.year === y
                    ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white shadow-md'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* Region Pre-fill */}
        <div className="flex-1">
          <label className="flex items-center gap-2 text-sm font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
            <Globe size={16} className="text-zinc-400" /> Pre-fill Holidays <Tooltip text="Select a region to automatically mark common public holidays" />
          </label>
          <select 
            value={selectedRegion}
            onChange={e => applyRegionHolidays(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none appearance-none cursor-pointer"
          >
            <option value="">Manual Only</option>
            {Object.entries(REGION_HOLIDAYS).map(([code, {label}]) => (
              <option key={code} value={code}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Month Grid */}
      <div>
        <label className="block text-sm font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
          Target Month
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {MONTH_NAMES.map((m, i) => (
            <button
              key={m}
              onClick={() => onChange({ month: i, holidays: [] })}
              aria-pressed={config.month === i}
              className={`py-2 rounded-xl text-sm font-semibold transition-all border outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-zinc-900 ${
                config.month === i
                  ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white shadow-md'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Holiday Markers */}
      <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Holiday Engine</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm">
              Weekends are automatically greyed out. Click on any weekday to toggle it as a holiday manually.
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-zinc-900 dark:text-white leading-none">{workingDays.length}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mt-1">Working Days</p>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-7 gap-1.5 text-[10px] font-bold uppercase tracking-wider text-center mb-2 text-zinc-400">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: new Date(config.year, config.month, 1).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dow = new Date(config.year, config.month, day).getDay()
              const isWeekend = dow === 0 || dow === 6
              const isHoliday = config.holidays.includes(day)
              return (
                <button
                  key={day}
                  onClick={() => toggleHoliday(day)}
                  disabled={isWeekend}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
                    isWeekend
                      ? 'bg-zinc-100/50 dark:bg-zinc-800/20 text-zinc-300 dark:text-zinc-700 cursor-not-allowed'
                      : isHoliday
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 scale-105 z-10 hover:bg-rose-600'
                      : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-sm'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex justify-center gap-6 mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-white border border-zinc-300 dark:bg-zinc-900 dark:border-zinc-700"></div> Work Day</span>
          <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-rose-500 shadow-sm shadow-rose-500/20"></div> Holiday</span>
          <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-zinc-100 dark:bg-zinc-800/50"></div> Weekend</span>
        </div>
      </div>
    </div>
  )
}
