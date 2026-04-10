import React, { useState } from 'react'

export function Tooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false)
  return (
    <span className="relative inline-block ml-1 align-middle">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        aria-label={text}
        className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs font-bold leading-none flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-black"
      >
        ?
      </button>
      {visible && (
        <span
          role="tooltip"
          className="absolute z-50 left-6 top-0 w-48 bg-gray-900 text-white text-xs rounded-lg px-2 py-1.5 shadow-lg pointer-events-none"
        >
          {text}
        </span>
      )}
    </span>
  )
}
