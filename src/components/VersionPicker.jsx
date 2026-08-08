import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Tag } from 'lucide-react'
import { VERSION_LIST, CURRENT_VERSION_ID } from '../versions'

const VersionPicker = () => {
  const [open, setOpen] = useState(false)
  const pickerRef = useRef(null)

  const current = VERSION_LIST.find(v => v.id === CURRENT_VERSION_ID) || VERSION_LIST[0]

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handlePick = (v) => {
    setOpen(false)
    if (v.id === CURRENT_VERSION_ID) return
    window.location.href = v.url
  }

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Switch Web App Version"
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 shadow-xs select-none"
      >
        <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>{current.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
          <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Switch App Version
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
              Active: {current.id}
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
            {VERSION_LIST.map((v, idx) => {
              const isCurrent = v.id === CURRENT_VERSION_ID
              return (
                <button
                  key={v.id}
                  onClick={() => handlePick(v)}
                  className={`w-full text-left px-3.5 py-3 transition-colors flex flex-col gap-1 ${
                    isCurrent
                      ? 'bg-blue-50/70 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        idx === 0 ? 'bg-emerald-500 animate-pulse' : idx === 1 ? 'bg-blue-500' : 'bg-slate-400'
                      }`} />
                      <span className="text-xs sm:text-sm font-bold">
                        {v.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {v.isLatest && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider">
                          Latest
                        </span>
                      )}
                      {isCurrent && (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </div>
                  </div>

                  {v.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-4 leading-normal">
                      {v.description}
                    </p>
                  )}
                </button>
              )
            })}
          </div>

          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 text-[10px] text-slate-400 text-center font-medium">
            💡 All domain versions share the same saved local history
          </div>
        </div>
      )}
    </div>
  )
}

export default VersionPicker
