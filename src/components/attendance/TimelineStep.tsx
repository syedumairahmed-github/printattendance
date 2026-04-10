import React from 'react'
import type { AttendanceConfig } from './types'
import { getWorkingDays, getMonthName } from './utils'
import { Tooltip } from './Tooltip'

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

export function TimelineStep({ config, onChange }: Props) {
  const workingDays = getWorkingDays(config.year, config.month, config.holidays)
  const daysInMonth = new Date(config.year, config.month + 1, 0).getDate()

  function toggleHoliday(day: number) {
    const dow = new Date(config.year, config.month, day).getDay()
    if (dow === 0 || dow === 6) return // can't toggle weekends
    const holidays = config.holidays.includes(day)
      ? config.holidays.filter(h => h !== day)
      : [...config.holidays, day]
    onChange({ holidays })
  }

  return (
    <div className="space-y-6">
      {/* Year Selector */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Year <Tooltip text="Select the academic or calendar year for the attendance sheet" />
        </label>
        <div className="flex gap-2 flex-wrap">
          {years.map(y => (
            <button
              key={y}
              onClick={() => onChange({ year: y, holidays: [] })}
              aria-pressed={config.year === y}
              className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                config.year === y
                  ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                  : 'hover:border-gray-400 dark:border-gray-600'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Month Grid */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Month <Tooltip text="Select the month for which to generate the attendance register" />
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {MONTH_NAMES.map((m, i) => (
            <button
              key={m}
              onClick={() => onChange({ month: i, holidays: [] })}
              aria-pressed={config.month === i}
              className={`py-2 border rounded-lg text-sm font-medium transition-all ${
                config.month === i
                  ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                  : 'hover:border-gray-400 dark:border-gray-600'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Holiday Markers */}
      <div>
        <p className="text-sm font-medium mb-1">
          Holiday / Leave Markers <Tooltip text="Click on weekdays to mark them as holidays. They will be excluded from working day count or colored differently." />
        </p>
        <p className="text-xs text-gray-500 mb-3">
          Weekends (Sat/Sun) are automatically excluded. Click weekdays to mark as holidays.
        </p>
        <div className="grid grid-cols-7 gap-1 text-xs text-center mb-1 font-medium">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for offset */}
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
                aria-label={`Day ${day}${isWeekend ? ' (weekend)' : isHoliday ? ' (holiday, click to unmark)' : ' (click to mark as holiday)'}`}
                className={`aspect-square rounded text-xs font-medium transition-all focus:outline-none focus:ring-1 focus:ring-black ${
                  isWeekend
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-default'
                    : isHoliday
                    ? 'bg-red-500 text-white cursor-pointer'
                    : 'bg-green-50 dark:bg-green-900/20 text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-yellow-100'
                }`}
              >
                {day}
              </button>
            )
          })}
        </div>
        <div className="flex gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-50 dark:bg-green-900/20 border inline-block"></span> Working day</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block"></span> Holiday</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-800 inline-block"></span> Weekend</span>
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm font-semibold">
          {getMonthName(config.month)} {config.year} — <span className="text-black dark:text-white">{workingDays.length} working days</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {config.holidays.length} holiday(s) marked · {daysInMonth - workingDays.length - config.holidays.length} weekend days
        </p>
      </div>
    </div>
  )
}
