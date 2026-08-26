import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, AlertTriangle, X } from 'lucide-react'
import { storageService } from '../services/storageService'
import DairyOrderTable from './DairyOrderTable'

const OtherDairyManager = ({ onOpenFestivalAdvisor }) => {
  const [dairies, setDairies] = useState(() => storageService.getCustomDairies())
  const [activeDairyId, setActiveDairyId] = useState(() => {
    const list = storageService.getCustomDairies()
    return list[0]?.id || 'otherdairy'
  })

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newDairyName, setNewDairyName] = useState('')
  const [addError, setAddError] = useState('')

  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [renameDairyTarget, setRenameDairyTarget] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [renameError, setRenameError] = useState('')

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [dairyToDelete, setDairyToDelete] = useState(null)

  // Ensure activeDairyId is valid whenever dairies list changes
  useEffect(() => {
    if (!dairies.some(d => d.id === activeDairyId)) {
      if (dairies.length > 0) {
        setActiveDairyId(dairies[0].id)
      }
    }
  }, [dairies, activeDairyId])

  const activeDairy = dairies.find(d => d.id === activeDairyId) || dairies[0] || { id: 'otherdairy', name: 'Namaste India' }

  // ── Handlers ────────────────────────────────────────────────────────────────

  // 1. Create New Dairy
  const handleOpenAdd = () => {
    setNewDairyName(`Namaste India ${dairies.length + 1}`)
    setAddError('')
    setIsAddOpen(true)
  }

  const handleCreateDairy = (e) => {
    e?.preventDefault()
    const name = newDairyName.trim()
    if (!name) {
      setAddError('Please enter a valid dairy name')
      return
    }

    const newId = 'otherdairy_cd_' + Date.now()
    const newEntry = {
      id: newId,
      name,
      createdAt: Date.now()
    }

    const updatedList = [...dairies, newEntry]
    setDairies(updatedList)
    storageService.saveCustomDairies(updatedList)
    setActiveDairyId(newId)
    setIsAddOpen(false)
    setNewDairyName('')
    setAddError('')
  }

  // 2. Rename Dairy
  const handleOpenRename = (dairy) => {
    setRenameDairyTarget(dairy)
    setRenameValue(dairy.name)
    setRenameError('')
    setIsRenameOpen(true)
  }

  const handleSaveRename = (e) => {
    e?.preventDefault()
    const name = renameValue.trim()
    if (!name) {
      setRenameError('Dairy name cannot be empty')
      return
    }

    const targetId = renameDairyTarget ? renameDairyTarget.id : activeDairy.id
    const updatedList = dairies.map(d => d.id === targetId ? { ...d, name } : d)
    setDairies(updatedList)
    storageService.saveCustomDairies(updatedList)
    setIsRenameOpen(false)
    setRenameDairyTarget(null)
    setRenameError('')
  }

  // 3. Delete Dairy
  const handleOpenDelete = (dairy) => {
    setDairyToDelete(dairy)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!dairyToDelete) return

    const targetId = dairyToDelete.id

    const updatedList = storageService.deleteCustomDairy(targetId) || []
    setDairies(updatedList)

    if (updatedList.length > 0) {
      setActiveDairyId(updatedList[0].id)
    }

    setIsDeleteOpen(false)
    setDairyToDelete(null)
  }

  return (
    <div className="space-y-4">
      {/* ── Sub-Navigation Bar matching exact style and colors of the Top Tab Switcher ── */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-slate-200/70 dark:bg-slate-800 rounded-2xl w-full sm:w-fit shadow-2xs">
        {dairies.map((dairy) => {
          const isActive = dairy.id === activeDairyId
          return (
            <div
              key={dairy.id}
              onClick={() => setActiveDairyId(dairy.id)}
              className={`group flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-2.5 rounded-xl text-xs sm:text-base font-bold font-display transition-all duration-200 min-h-[44px] sm:min-h-0 select-none cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span className="text-sm sm:text-base">🍶</span>
              <span className="truncate">{dairy.name}</span>

              {/* Action buttons (Rename & Delete) */}
              <div className={`flex items-center gap-1 ml-1 ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenRename(dairy)
                  }}
                  title="Rename Dairy"
                  className={`p-1 rounded-md transition-colors ${
                    isActive
                      ? 'hover:bg-blue-50 dark:hover:bg-slate-600 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Edit2 className="w-3 h-3" />
                </button>

                {dairies.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenDelete(dairy)
                    }}
                    title="Delete Custom Dairy"
                    className="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 dark:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {/* + Create Custom Dairy Button (Matching top tab style & colors) */}
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-2.5 rounded-xl text-xs sm:text-base font-bold font-display text-blue-600 dark:text-blue-400 hover:bg-white/80 dark:hover:bg-slate-700/80 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200 min-h-[44px] sm:min-h-0 select-none cursor-pointer border border-dashed border-blue-300 dark:border-blue-700/50"
        >
          <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="truncate">+ Create Custom Dairy</span>
        </button>
      </div>

      {/* Render the Order Table for the selected active custom dairy */}
      {activeDairy && (
        <DairyOrderTable
          key={activeDairy.id}
          tabName={`🍶 ${activeDairy.name}`}
          tabKey={activeDairy.id}
          onOpenFestivalAdvisor={onOpenFestivalAdvisor}
        />
      )}

      {/* ── Add Custom Dairy Modal ── */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Create New Custom Dairy
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-red-500 hover:text-white dark:bg-slate-700 dark:hover:bg-red-600 dark:hover:text-white text-slate-500 dark:text-slate-300 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleCreateDairy} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Custom Dairy Name
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g., Namaste India, Market Dairy"
                  value={newDairyName}
                  onChange={(e) => {
                    setNewDairyName(e.target.value)
                    if (addError) setAddError('')
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {addError && (
                  <p className="text-xs text-red-500 font-semibold mt-1">⚠️ {addError}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  Create Dairy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Rename Custom Dairy Modal ── */}
      {isRenameOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Rename Custom Dairy
              </h3>
              <button
                onClick={() => setIsRenameOpen(false)}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-red-500 hover:text-white dark:bg-slate-700 dark:hover:bg-red-600 dark:hover:text-white text-slate-500 dark:text-slate-300 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleSaveRename} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Dairy Name
                </label>
                <input
                  type="text"
                  autoFocus
                  value={renameValue}
                  onChange={(e) => {
                    setRenameValue(e.target.value)
                    if (renameError) setRenameError('')
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {renameError && (
                  <p className="text-xs text-red-500 font-semibold mt-1">⚠️ {renameError}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRenameOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Custom Dairy Confirmation Modal ── */}
      {isDeleteOpen && dairyToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  Delete "{dairyToDelete.name}"?
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{dairyToDelete.name}</strong>? All active draft items and saved history records for this custom dairy will be deleted permanently.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-md shadow-red-500/20 transition-all cursor-pointer"
              >
                Yes, Delete Dairy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OtherDairyManager
