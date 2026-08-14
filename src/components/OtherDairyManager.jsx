import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, AlertTriangle, X, Store } from 'lucide-react'
import { storageService } from '../services/storageService'
import DairyOrderTable from './DairyOrderTable'

const OtherDairyManager = ({ onOpenLogs, onOpenFestivalAdvisor }) => {
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

    storageService.addActivityLog({
      tab: 'Other Dairy',
      action: 'Create Custom Dairy',
      details: `Created new custom dairy "${name}"`,
      type: 'save'
    })
  }

  // 2. Rename Dairy
  const handleOpenRename = (dairy) => {
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

    const updatedList = dairies.map(d => d.id === activeDairy.id ? { ...d, name } : d)
    setDairies(updatedList)
    storageService.saveCustomDairies(updatedList)
    setIsRenameOpen(false)
    setRenameError('')

    storageService.addActivityLog({
      tab: activeDairy.name,
      action: 'Rename Custom Dairy',
      details: `Renamed custom dairy to "${name}"`,
      type: 'update'
    })
  }

  // 3. Delete Dairy
  const handleOpenDelete = (dairy) => {
    setDairyToDelete(dairy)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!dairyToDelete) return

    const targetId = dairyToDelete.id
    const targetName = dairyToDelete.name

    const updatedList = storageService.deleteCustomDairy(targetId) || []
    setDairies(updatedList)

    if (updatedList.length > 0) {
      setActiveDairyId(updatedList[0].id)
    }

    setIsDeleteOpen(false)
    setDairyToDelete(null)

    storageService.addActivityLog({
      tab: 'Other Dairy',
      action: 'Delete Custom Dairy',
      details: `Deleted custom dairy "${targetName}" and all associated history`,
      type: 'delete'
    })
  }

  return (
    <div className="space-y-4">
      {/* Custom Dairy Management Header Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-1.5">
                Other Dairy Outlets
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-semibold">
                  {dairies.length} {dairies.length === 1 ? 'Dairy' : 'Dairies'}
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Create and manage multiple custom dairies under Other Dairy
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white transition-all shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Custom Dairy</span>
          </button>
        </div>

        {/* Custom Dairies Pill Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {dairies.map((dairy) => {
            const isActive = dairy.id === activeDairyId
            return (
              <div
                key={dairy.id}
                className={`group relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                    : 'bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                onClick={() => setActiveDairyId(dairy.id)}
              >
                <span>🍶 {dairy.name}</span>

                {/* Actions inside active or hovered tab */}
                <div className={`flex items-center gap-1 ml-1 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenRename(dairy)
                    }}
                    title="Rename Dairy"
                    className={`p-1 rounded-md transition-colors ${
                      isActive
                        ? 'hover:bg-purple-700 text-purple-100'
                        : 'hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenDelete(dairy)
                    }}
                    title="Delete Custom Dairy"
                    className={`p-1 rounded-md transition-colors ${
                      isActive
                        ? 'hover:bg-red-500 text-white'
                        : 'hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 dark:text-red-400'
                    }`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Render the Order Table for the selected active custom dairy */}
      {activeDairy && (
        <DairyOrderTable
          key={activeDairy.id}
          tabName={`🍶 ${activeDairy.name}`}
          tabKey={activeDairy.id}
          onOpenLogs={onOpenLogs}
          onOpenFestivalAdvisor={onOpenFestivalAdvisor}
        />
      )}

      {/* ── Add Custom Dairy Modal ── */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" />
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
                  placeholder="e.g., Other Dairy 2, Market Branch"
                  value={newDairyName}
                  onChange={(e) => {
                    setNewDairyName(e.target.value)
                    if (addError) setAddError('')
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                {addError && (
                  <p className="text-xs text-red-500 font-semibold mt-1">⚠️ {addError}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20 transition-all"
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
                <Edit2 className="w-4 h-4 text-purple-600" />
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                {renameError && (
                  <p className="text-xs text-red-500 font-semibold mt-1">⚠️ {renameError}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRenameOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20 transition-all"
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
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 transition-all"
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
