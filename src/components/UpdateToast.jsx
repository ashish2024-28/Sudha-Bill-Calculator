// ═══════════════════════════════════════════════════════════════════════════════
// UpdateToast.jsx
// ───────────────────────────────────────────────────────────────────────────────
// Shows a "New version available" banner when Vite PWA plugin detects that a new
// service worker is waiting.  The user can click "Update now" which calls
// updateSW() → triggers skipWaiting → reloads the page with the new build.
//
// HOW IT WORKS:
//   Vite PWA plugin's registerSW({ onNeedRefresh }) fires onNeedRefresh when
//   the SW has downloaded a new version but is waiting to activate.
//   We call updateSW() to tell the SW to skipWaiting, which makes the new
//   version active, then window.location.reload() loads the fresh assets.
//
// USAGE:  Add <UpdateToast /> once inside App.jsx (bottom of return, before </div>)
// ═══════════════════════════════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { registerSW } from 'virtual:pwa-register'

const UpdateToast = () => {
  const [show, setShow] = useState(false)
  const [updateSW, setUpdateSW] = useState(null)
  const [autoUpdate, setAutoUpdate] = useState(
    () => localStorage.getItem('pwa-auto-update') === 'true'
  )

  useEffect(() => {
    const update = registerSW({
      onNeedRefresh() {
        // Check if user enabled auto-update
        if (localStorage.getItem('pwa-auto-update') === 'true') {
          update(true) // auto-apply
        } else {
          setShow(true)
        }
      },
      onOfflineReady() {},
    })
    setUpdateSW(() => update)
  }, [])

  const handleUpdate = () => {
    if (updateSW) updateSW(true)
  }

  const handleToggleAuto = () => {
    const next = !autoUpdate
    setAutoUpdate(next)
    localStorage.setItem('pwa-auto-update', String(next))
  }

  const handleLater = () => setShow(false)

  if (!show) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50">
      <div className="card p-4 shadow-2xl border border-blue-100 dark:border-blue-800 bg-white dark:bg-slate-800">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
            <RefreshCw size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">
              New version available
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              A newer version of the app is ready.
            </p>
          </div>
          <button onClick={handleLater} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex-shrink-0">
            <X size={15} />
          </button>
        </div>

        {/* Auto-update toggle */}
        <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoUpdate}
            onChange={handleToggleAuto}
            className="accent-blue-500 w-4 h-4"
          />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Auto-update in future
          </span>
        </label>

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleUpdate}
            className="flex-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center justify-center gap-1.5"
          >
            <RefreshCw size={12} />
            Yes, Update
          </button>
          <button
            onClick={handleLater}
            className="px-3 py-1.5 rounded-xl text-xs border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  )
}

export default UpdateToast