import React, { useState } from 'react'
import { APP_VERSIONS, CURRENT_VERSION_ID } from '../versions'

const VersionPicker = () => {
  const [open, setOpen] = useState(false)
  const current = APP_VERSIONS.find(v => v.id === CURRENT_VERSION_ID) || APP_VERSIONS[0]

  const handlePick = (v) => {
    setOpen(false)
    if (v.id === CURRENT_VERSION_ID) return
    window.location.href = v.url
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={[
          'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold',
          'border border-slate-200 dark:border-slate-600',
          'bg-white dark:bg-slate-800',
          'text-slate-600 dark:text-slate-300',
          'hover:border-blue-300 dark:hover:border-blue-600',
          'transition-colors select-none',
        ].join(' ')}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
        {current.label}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          <div className="absolute right-0 mt-2 w-72 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-xl overflow-hidden">

            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              Switch version
            </div>

            {APP_VERSIONS.map((v, idx) => {
              const isCurrent = v.id === CURRENT_VERSION_ID
              return (
                <button
                  key={v.id}
                  onClick={() => handlePick(v)}
                  className={[
                    'w-full text-left px-3 py-2.5 transition-colors',
                    'border-b border-slate-50 dark:border-slate-700/50 last:border-0',
                    isCurrent
                      ? 'bg-blue-50 dark:bg-blue-900/20 cursor-default'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={[
                        'w-2 h-2 rounded-full flex-shrink-0',
                        idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-blue-400' : 'bg-slate-300',
                      ].join(' ')} />
                      <span className={[
                        'text-sm font-semibold',
                        isCurrent
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-700 dark:text-slate-200',
                      ].join(' ')}>
                        {v.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {v.isLatest && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800">
                          Latest
                        </span>
                      )}
                      {isCurrent && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {v.description && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 ml-4">
                      {v.description}
                    </p>
                  )}
                  {v.date && (
                    <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5 ml-4">
                      {v.date}
                    </p>
                  )}
                </button>
              )
            })}

            <div className="px-3 py-2 bg-emerald-50 dark:bg-emerald-900/10 border-t border-emerald-100 dark:border-emerald-900/30 text-[10px] text-emerald-700 dark:text-emerald-400">
              All versions share the same saved history
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default VersionPicker