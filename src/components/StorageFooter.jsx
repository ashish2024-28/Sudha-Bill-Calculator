import React, { useState, useEffect } from 'react'
import { HardDrive, RefreshCw, ChevronUp, ChevronDown, ShieldCheck, Info } from 'lucide-react'
import { storageService } from '../services/storageService'

const StorageFooter = () => {
  const [stats, setStats] = useState(() => storageService.getStorageStats())
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pwaEstimate, setPwaEstimate] = useState(null)

  const refreshStats = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setStats(storageService.getStorageStats())
      checkNavigatorStorage()
      setIsRefreshing(false)
    }, 250)
  }

  const checkNavigatorStorage = async () => {
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate()
        if (estimate.usage !== undefined) {
          const usageKB = (estimate.usage / 1024).toFixed(1)
          const quotaMB = (estimate.quota / (1024 * 1024)).toFixed(0)
          setPwaEstimate({ usageKB, quotaMB })
        }
      } catch (e) {
        console.warn('Storage estimate failed:', e)
      }
    }
  }

  useEffect(() => {
    checkNavigatorStorage()
    // Periodic refresh every 10 seconds or when window gains focus
    const handleFocus = () => refreshStats()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 px-3">
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs rounded-2xl border border-slate-200/80 dark:border-slate-700/70 p-3 sm:p-4 shadow-xs transition-all">
        {/* Main Footer Summary Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Device Storage:
                </span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-md">
                  {stats.totalFormatted}
                </span>
                <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                  of ~{stats.quotaFormatted} ({stats.percentUsed}%)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                100% Offline-first local database. No cloud server needed.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={refreshStats}
              title="Refresh Storage Usage"
              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
            </button>

            <button
              onClick={() => setIsExpanded(v => !v)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium text-[11px] transition-colors"
            >
              <span>{isExpanded ? 'Hide Storage Breakdown' : 'Storage Breakdown'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Storage Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(1, Math.min(100, stats.percentUsed))}%` }}
          />
        </div>

        {/* Expandable Breakdown Drawer */}
        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/70 animate-fadeIn space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                How This App Takes Space & Memory
              </span>
              {pwaEstimate && (
                <span>PWA Cache + Data: ~{pwaEstimate.usageKB} KB</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {stats.items.map((item) => (
                <div
                  key={item.key}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700/50 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {item.label}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-700">
                      {item.formatted}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">
                    {item.detail}
                  </div>
                </div>
              ))}
            </div>

            {/* Explanatory notes */}
            <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
              <div className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0" />
                How Local Storage & Privacy Works:
              </div>
              <p className="leading-relaxed">
                All daily milk & dahi entries, prices, and changes are stored instantly in your browser's persistent <strong>LocalStorage</strong> on this phone/computer. No data is ever sent to external servers, ensuring complete privacy, zero cellular data usage for calculations, and instant offline availability.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StorageFooter
