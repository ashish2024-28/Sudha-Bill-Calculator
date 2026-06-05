import React, { useRef } from 'react'
import {
  Download, Upload, Trash2, Printer, Share2, FileJson
} from 'lucide-react'
import { storageService } from '../services/storageService'
import { printBill, shareData } from '../utils/calculations'

const ActionButton = ({ icon: Icon, label, onClick, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600',
    danger: 'bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800',
    primary: 'bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
    success: 'bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 ${variants[variant]} ${className}`}
    >
      <Icon size={15} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

const ExportImport = ({ products, summary, onImport, onClearAll, onToast }) => {
  const fileInputRef = useRef(null)

  const handleExport = () => {
    if (products.length === 0) {
      onToast('No products to export', 'warning')
      return
    }
    storageService.exportToJSON(products)
    onToast('Exported successfully!', 'success')
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const imported = await storageService.importFromJSON(file)
      onImport(imported)
      onToast(`Imported ${imported.length} products!`, 'success')
    } catch (err) {
      onToast(err.message || 'Import failed', 'error')
    }

    e.target.value = ''
  }

  const handlePrint = () => {
    if (products.length === 0) {
      onToast('No products to print', 'warning')
      return
    }
    printBill(products, summary)
  }

  const handleShare = async () => {
    if (products.length === 0) {
      onToast('No products to share', 'warning')
      return
    }
    try {
      const result = await shareData(products, summary)
      if (result === 'copied') {
        onToast('Bill copied to clipboard!', 'success')
      } else {
        onToast('Bill shared successfully!', 'success')
      }
    } catch {
      onToast('Failed to share', 'error')
    }
  }

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 font-display mr-1 hidden sm:block">
          Actions:
        </p>

        <ActionButton icon={Printer} label="Print" onClick={handlePrint} variant="default" />
        <ActionButton icon={Share2} label="Share" onClick={handleShare} variant="primary" />
        <ActionButton icon={Download} label="Export JSON" onClick={handleExport} variant="success" />
        <ActionButton icon={Upload} label="Import JSON" onClick={handleImportClick} variant="default" />
        <ActionButton icon={Trash2} label="Clear All" onClick={onClearAll} variant="danger" />

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}

export default ExportImport
