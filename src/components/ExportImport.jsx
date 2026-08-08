import React, { useState } from 'react'
import { Printer, Share2 } from 'lucide-react'

const STORAGE_KEY = 'dairy_history_v4'

const ActionButton = ({ icon: Icon, label, onClick, variant = 'default' }) => {
  const variants = {
    default: 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600',
    primary: 'bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
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
  const [toast, setToast] = useState(null)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const handlePrint = () => window.print()

  const handleShare = async () => {
    try {
      const pageTitle = document.title || 'Dairy History'
      const pageUrl = window.location.href
      const shareDate = new Date().toLocaleString()

      localStorage.setItem(
        `${STORAGE_KEY}_share_meta`,
        JSON.stringify({ lastShared: shareDate, url: pageUrl })
      )

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
        <ActionButton icon={Printer}  label="Print" onClick={handlePrint} variant="default" />
        <ActionButton icon={Share2}   label="Share" onClick={handleShare} variant="primary" />
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