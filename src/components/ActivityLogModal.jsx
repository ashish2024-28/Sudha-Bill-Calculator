import React, { useState, useEffect } from 'react'
import { History, X, Search, Trash2, Clock, CheckCircle2, RefreshCw, Filter, ArrowRightLeft, FileText } from 'lucide-react'
import { storageService } from '../services/storageService'

const ActivityLogModal = ({ isOpen, onClose, onRestoreDraft }) => {
  const [logs, setLogs] = useState([])
  const [filterTab, setFilterTab] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadLogs()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const loadLogs = () => {
    const data = storageService.getActivityLogs()
    setLogs(data)
  }

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all activity logs?')) {
      storageService.clearActivityLogs()
      setLogs([])
    }
  }

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return isoString
    }
  }

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'save':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
      case 'update':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
      case 'delete':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
      case 'restore':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesTab = filterTab === 'all' || (log.tab && log.tab.toLowerCase().includes(filterTab.toLowerCase()))
    const matchesType = filterType === 'all' || log.type === filterType
    const matchesSearch = !searchQuery || 
      (log.action && log.action.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.tab && log.tab.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesTab && matchesType && matchesSearch
  })

  if (!isOpen) return null

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-800 dark:text-slate-100">
                Activity Logs & Change History
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-body">
                Auto-tracked edits, saves & local updates ({logs.length} entries)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs by action, product, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            <select
              value={filterTab}
              onChange={(e) => setFilterTab(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="all">All Dairies</option>
              <option value="patna">Patna Dairy</option>
              <option value="arra">Arra Dairy</option>
              <option value="other">Other Dairy</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="all">All Actions</option>
              <option value="update">Edits / Updates</option>
              <option value="save">Saves</option>
              <option value="restore">Restores</option>
              <option value="delete">Deletions</option>
            </select>

            {logs.length > 0 && (
              <button
                onClick={handleClearLogs}
                className="ml-auto text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium flex items-center gap-1 hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Logs
              </button>
            )}
          </div>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-400 dark:text-slate-500">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-slate-600 dark:text-slate-400">No activity logs found</p>
              <p className="text-xs mt-1">Changes and calculations will automatically be logged here.</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-xs hover:border-slate-200 dark:hover:border-slate-600 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${getBadgeStyle(log.type)}`}>
                      {log.action}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {log.tab}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 whitespace-nowrap">
                    <Clock className="w-3 h-3" /> {formatTime(log.timestamp)}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-700 dark:text-slate-300 font-body leading-relaxed">
                  {log.details}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between text-xs text-slate-500">
          <p className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Auto-saved in Local Storage
          </p>
          <button
            onClick={onClose}
            className="btn-secondary py-1.5 px-4 text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  )
}

export default ActivityLogModal
