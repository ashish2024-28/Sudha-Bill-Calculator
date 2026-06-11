import React, { useRef, useState } from 'react'
import { Download, Upload, Trash2, Printer, Share2 } from 'lucide-react'

const STORAGE_KEY = 'dairy_history_v4'

const ActionButton = ({ icon: Icon, label, onClick, variant = 'default' }) => {
  const variants = {
    default: 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600',
    danger:  'bg-red-50 dark:bg-red-900/30 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800',
    primary: 'bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
    success: 'bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
  }
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xl font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 ${variants[variant]}`}
    >
      <Icon size={15} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

const ExportImport = () => {
  const fileInputRef = useRef(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const handleExport = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY) || '{}'
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dairy_history_${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      showToast('Exported successfully!', 'success')
    } catch {
      showToast('Export failed', 'error')
    }
  }

  const handleImportClick = () => fileInputRef.current?.click()

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
        showToast('Imported! Reload to see changes.', 'success')
      } catch {
        showToast('Invalid JSON file', 'error')
      }
      e.target.value = ''
    }
    reader.readAsText(file)
  }

  const handleClearAll = () => {
    if (!window.confirm('Clear all saved history? This cannot be undone.')) return
    localStorage.removeItem(STORAGE_KEY)
    showToast('All history cleared.', 'warning')
  }

  // ✅ Print: triggers full page print via browser
  const handlePrint = () => window.print()

  // ✅ Share: formats data nicely with date, saves share date to localStorage,
  //           uses Web Share API (full page title + formatted text) or clipboard fallback
  const handleShare = async () => {
  try {
    const pageTitle = document.title || 'Dairy History'
    const pageUrl = window.location.href
    const shareDate = new Date().toLocaleString()

    // Save share date to localStorage
    localStorage.setItem(
      `${STORAGE_KEY}_share_meta`,
      JSON.stringify({ lastShared: shareDate, url: pageUrl })
    )

    // Trigger print dialog first, then share after
    window.print()

    const shareText = `📋 ${pageTitle}\n🔗 ${pageUrl}\n📅 Shared on: ${shareDate}`

    if (navigator.share) {
      await navigator.share({ title: pageTitle, text: shareText, url: pageUrl })
      showToast('Shared!', 'success')
    } else {
      await navigator.clipboard.writeText(shareText)
      showToast('Copied to clipboard!', 'success')
    }
  } catch (err) {
    if (err?.name !== 'AbortError') showToast('Share failed', 'error')
  }
}

  const toastColors = {
    success: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400',
    error:   'text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
    warning: 'text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',
  }

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 font-display mr-1 hidden sm:block">
          Actions:
        </p>
        <ActionButton icon={Printer}  label="Print"       onClick={handlePrint}       variant="default" />
        <ActionButton icon={Share2}   label="Share"       onClick={handleShare}       variant="primary" />
        {/* <ActionButton icon={Download} label="Export JSON" onClick={handleExport}      variant="success" /> */}
        {/* <ActionButton icon={Upload}   label="Import JSON" onClick={handleImportClick} variant="default" /> */}
        {/* <ActionButton icon={Trash2}   label="Clear All"   onClick={handleClearAll}    variant="danger"  /> */}
        <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
      </div>
      {toast && (
        <p className={`mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg ${toastColors[toast.type]}`}>
          {toast.msg}
        </p>
      )}
    </div>
  )
}

export default ExportImport