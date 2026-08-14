import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  Calendar,
  X,
  Search,
  Sparkles,
  Bell,
  Plus,
  Trash2,
  Check,
  Share2,
  ArrowUp,
  Tag,
  Clock,
  ChevronRight,
  Filter,
  History,
  CheckCircle2,
  Flame,
  CalendarDays
} from 'lucide-react'
import { getFestivalAdvisor } from '../data/festivalCalendar'
import { storageService } from '../services/storageService'

const EMOJI_PRESETS = [
  '🎉', '🪔', '🥛', '🌸', '🎁', '☀️', '🌾', '💖', '🍰', '🎪',
  '🚩', '🌙', '🇮🇳', '🌺', '🦚', '🔥', '🌼', '👑', '🥳', '🪁',
  '🧘', '🐘', '🏹', '🎨', '🌕', '🌿', '🐄', '⚓', '🎄', '🎆'
]

const CATEGORY_PRESETS = [
  'Social Media / Trending',
  'Major Festival',
  'Chhath Mahaparv',
  'Diwali Festival',
  'Fasting & Puja',
  'Special Day',
  'Celebration',
  'National Day',
  'State Day',
  'Cultural Festival',
  'Spiritual Festival',
  'Local Festival / Mela'
]

const FestivalAdvisorModal = ({ isOpen, onClose, referenceDate = '' }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all' | 'imminent' | 'social' | 'custom' | 'national' | 'completed'
  const [customFestivals, setCustomFestivals] = useState(() => storageService.getCustomFestivals())
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)

  const scrollContainerRef = useRef(null)

  // Form states for adding custom festival
  const [newName, setNewName] = useState('')
  const [newHindiName, setNewHindiName] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newCategory, setNewCategory] = useState('Social Media / Trending')
  const [newIcon, setNewIcon] = useState('🎉')
  const [formError, setFormError] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  // Sync custom festivals on modal open
  useEffect(() => {
    if (isOpen) {
      setCustomFestivals(storageService.getCustomFestivals())
      setIsAddFormOpen(false)
      setSearchQuery('')
      setFilterType('all')
    }
  }, [isOpen])

  // Handle scroll to show/hide "Back to Top"
  const handleScroll = (e) => {
    if (e.target.scrollTop > 240) {
      setShowBackToTop(true)
    } else {
      setShowBackToTop(false)
    }
  }

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const todayIso = referenceDate || new Date().toISOString().split('T')[0]
  
  // Calculate dynamic 1-2 years rolling reminders with auto-removal of completed events
  const reminderData = useMemo(() => {
    return getFestivalAdvisor(todayIso, customFestivals)
  }, [todayIso, customFestivals])

  // Filtered festivals list (Automatically removes completed ones unless 'completed' tab is selected)
  const filteredList = useMemo(() => {
    const isCompletedView = filterType === 'completed'
    const sourceList = isCompletedView ? reminderData.completedFestivals : reminderData.allUpcoming

    return sourceList.filter(item => {
      const q = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.hindiName && item.hindiName.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        item.date.includes(q)

      const matchesFilter =
        filterType === 'all' ||
        filterType === 'completed' ||
        (filterType === 'imminent' && item.diffDays <= 3 && !item.isCompleted) ||
        (filterType === 'social' && item.category && (item.category.toLowerCase().includes('social') || item.category.toLowerCase().includes('special'))) ||
        (filterType === 'custom' && item.isCustom) ||
        (filterType === 'national' && item.category && item.category.toLowerCase().includes('national'))

      return matchesQuery && matchesFilter
    })
  }, [reminderData, searchQuery, filterType])

  // Group filtered list by Month & Year for clean calendar layout
  const groupedByMonth = useMemo(() => {
    const groups = {}
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    filteredList.forEach(fest => {
      const parts = fest.date.split('-')
      if (parts.length === 3) {
        const y = parts[0]
        const m = parseInt(parts[1], 10)
        const monthKey = `${months[m - 1]} ${y}`
        if (!groups[monthKey]) {
          groups[monthKey] = []
        }
        groups[monthKey].push(fest)
      } else {
        if (!groups['Other']) groups['Other'] = []
        groups['Other'].push(fest)
      }
    })

    return groups
  }, [filteredList])

  if (!isOpen) return null

  // Format date helper (e.g. Sat, 15 Aug 2026)
  const formatDateLabel = (isoStr) => {
    if (!isoStr) return ''
    try {
      const d = new Date(`${isoStr}T00:00:00`)
      return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return isoStr
    }
  }

  // Handle Add New Custom Festival
  const handleAddFestival = (e) => {
    e.preventDefault()
    setFormError('')

    if (!newName.trim()) {
      setFormError('Please enter the festival or event name.')
      return
    }
    if (!newDate) {
      setFormError('Please select a valid event date.')
      return
    }

    const newEntry = {
      id: `custom_fest_${Date.now()}`,
      name: newName.trim(),
      hindiName: newHindiName.trim() || newName.trim(),
      date: newDate,
      category: newCategory,
      icon: newIcon,
      isCustom: true
    }

    const updated = storageService.addCustomFestival(newEntry)
    setCustomFestivals(updated)

    // Reset form
    setNewName('')
    setNewHindiName('')
    setNewDate('')
    setNewCategory('Social Media / Trending')
    setNewIcon('🎉')
    setIsAddFormOpen(false)

    setToastMessage(`✓ Added "${newEntry.name}" to festival calendar!`)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Handle Delete Custom Festival
  const handleDeleteCustom = (id, name) => {
    if (window.confirm(`Remove festival reminder for "${name}"?`)) {
      const updated = storageService.deleteCustomFestival(id)
      setCustomFestivals(updated)
      setToastMessage(`Removed "${name}".`)
      setTimeout(() => setToastMessage(''), 3000)
    }
  }

  return (
    <div
      id="festival-reminder-modal"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md animate-fadeIn overscroll-contain"
      role="dialog"
      aria-modal="true"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[94vh] sm:h-[88vh] max-h-[920px] overflow-hidden"
      >
        
        {/* ── Fixed Top Header ── */}
        <div className="shrink-0 px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20 text-lg shrink-0">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white truncate">
                  Festival Reminders & Calendar
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> 1–2 Years Auto-Rolling
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-body truncate">
                {reminderData.totalActiveCount} upcoming active events • Past events auto-removed from active queue
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              onClick={() => setIsAddFormOpen(!isAddFormOpen)}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Event</span>
              <span className="sm:hidden">Add</span>
            </button>

            {/* Prominent, Big Top-Right Cross Button */}
            <button
              onClick={onClose}
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-2xl bg-slate-100 hover:bg-red-500 hover:text-white dark:bg-slate-800 dark:hover:bg-red-600 dark:hover:text-white text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
              title="Close modal (Esc)"
              aria-label="Close modal"
            >
              <X className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="shrink-0 px-4 py-2 bg-emerald-600 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-fadeIn shadow-xs">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ── Collapsible Add Event / Social Media Form ── */}
        {isAddFormOpen && (
          <div className="shrink-0 p-4 sm:p-5 bg-orange-50/90 dark:bg-orange-950/40 border-b border-orange-200 dark:border-orange-900/60 animate-fadeIn">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Add New Festival / Social Media / Local Event
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddFormOpen(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                ✕ Cancel
              </button>
            </div>

            {formError && (
              <div className="mb-3 p-2.5 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-bold">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddFestival} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Event Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. World Milk Day / Local Fair / Puja"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Hindi / Regional Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. विश्व दुग्ध दिवस / स्थानीय मेला / पूजन"
                    value={newHindiName}
                    onChange={e => setNewHindiName(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white outline-none"
                  >
                    {CATEGORY_PRESETS.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Icon
                  </label>
                  <div className="flex items-center gap-1 overflow-x-auto p-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl no-scrollbar">
                    {EMOJI_PRESETS.slice(0, 12).map(emo => (
                      <button
                        type="button"
                        key={emo}
                        onClick={() => setNewIcon(emo)}
                        className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-transform shrink-0 ${
                          newIcon === emo
                            ? 'bg-orange-500 text-white scale-110 shadow-xs'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddFormOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  Save to Calendar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Fixed Search & Category Tabs ── */}
        <div className="shrink-0 p-3 sm:px-6 sm:py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-2.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search festival (e.g. 15 August, Chhath, Rakhi, Holi, Milk Day, Onam, 2027, 2028)..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 dark:text-slate-100 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Chips with horizontal touch scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: 'All Active (1-2 Yrs)', count: reminderData.totalActiveCount },
              { id: 'imminent', label: '⚡ 1–3 Days Reminders', count: reminderData.activeAlerts.length, highlight: true },
              { id: 'social', label: '📱 Social & Special' },
              { id: 'custom', label: `✨ Custom Added (${customFestivals.length})` },
              { id: 'national', label: '🇮🇳 National' },
              { id: 'completed', label: `✓ Completed / Past (${reminderData.totalCompletedCount})` }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  filterType === f.id
                    ? f.id === 'completed'
                      ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-xs'
                      : 'bg-orange-600 text-white shadow-xs'
                    : f.highlight && reminderData.hasActiveAlert
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span>{f.label}</span>
                {f.count !== undefined && f.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    filterType === f.id
                      ? f.id === 'completed'
                        ? 'bg-white/30 text-white dark:text-slate-900'
                        : 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {f.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable Calendar Content (Fixes scroll for all events) ── */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto modal-scroll-area px-3 sm:px-6 py-4 space-y-6 touch-pan-y"
        >
          {/* Active 1–3 Days Imminent Banner if present */}
          {reminderData.hasActiveAlert && filterType === 'all' && !searchQuery && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-300 dark:border-amber-800/80 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-xs font-black uppercase tracking-wider text-orange-900 dark:text-orange-200">
                  ⚡ Immediate Alerts (Next 1–3 Days):
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {reminderData.activeAlerts.map(fest => (
                  <div
                    key={`alert_${fest.id}`}
                    className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-orange-300 dark:border-orange-700/60 shadow-xs flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl shrink-0">{fest.icon}</span>
                      <div className="truncate">
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {fest.name}
                        </div>
                        <div className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold truncate">
                          {fest.hindiName}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded-full bg-orange-600 text-white font-black text-[10px] uppercase shadow-2xs block text-center">
                        {fest.timingLabel}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 block">
                        {formatDateLabel(fest.date)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Automatic Removal Info Callout (when viewing completed items) */}
          {filterType === 'completed' && (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                These {reminderData.totalCompletedCount} past events have already concluded and are automatically removed from your active reminder stream and dashboard banner.
              </span>
            </div>
          )}

          {/* Empty State */}
          {filteredList.length === 0 ? (
            <div className="text-center py-16 text-slate-400 dark:text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
              <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                {filterType === 'completed' ? 'No completed festivals found' : 'No matching active festivals found'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms or filter.</p>
              <button
                onClick={() => setIsAddFormOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Custom Festival Reminder</span>
              </button>
            </div>
          ) : (
            /* Monthly Sections (Chronologically Organized for 1-2+ Full Years) */
            Object.entries(groupedByMonth).map(([monthLabel, events]) => (
              <div key={monthLabel} className="space-y-2.5">
                {/* Month Sticky Header */}
                <div className="sticky top-0 z-10 py-1.5 px-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-xl flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      {monthLabel}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {events.length} {events.length === 1 ? 'event' : 'events'}
                  </span>
                </div>

                {/* Event Cards inside Month */}
                <div className="grid grid-cols-1 gap-2">
                  {events.map(fest => {
                    const isImminent = fest.diffDays <= 3 && !fest.isCompleted
                    const isCompleted = fest.isCompleted

                    return (
                      <div
                        key={fest.id}
                        className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isImminent
                            ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/80 shadow-2xs ring-1 ring-amber-400/20'
                            : isCompleted
                            ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800 opacity-75'
                            : 'bg-white dark:bg-slate-850/80 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-2xs ${
                            isImminent
                              ? 'bg-amber-100 dark:bg-amber-900/50'
                              : isCompleted
                              ? 'bg-slate-200/70 dark:bg-slate-800'
                              : 'bg-slate-100 dark:bg-slate-800'
                          }`}>
                            {fest.icon || '🎉'}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`font-bold text-sm sm:text-base truncate ${
                                isCompleted ? 'text-slate-600 dark:text-slate-400 line-through' : 'text-slate-900 dark:text-white'
                              }`}>
                                {fest.name}
                              </span>
                              {fest.hindiName && (
                                <span className={`text-xs font-semibold ${
                                  isCompleted ? 'text-slate-400 dark:text-slate-500' : 'text-orange-600 dark:text-orange-400'
                                }`}>
                                  • {fest.hindiName}
                                </span>
                              )}
                              {fest.isCustom && (
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                  Custom
                                </span>
                              )}
                              {isCompleted && (
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                  Completed
                                </span>
                              )}
                            </div>

                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                📅 {formatDateLabel(fest.date)}
                              </span>
                              <span>•</span>
                              <span className="text-slate-500 dark:text-slate-400">
                                {fest.category}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Countdown pill & Delete if custom */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full font-black text-xs tracking-wide whitespace-nowrap shadow-2xs ${
                              isCompleted
                                ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                : fest.diffDays === 0
                                ? 'bg-red-600 text-white animate-pulse'
                                : fest.diffDays === 1
                                ? 'bg-orange-600 text-white'
                                : fest.diffDays <= 3
                                ? 'bg-amber-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60'
                            }`}
                          >
                            {fest.timingLabel}
                          </span>

                          {fest.isCustom && (
                            <button
                              onClick={() => handleDeleteCustom(fest.id, fest.name)}
                              title="Delete custom festival"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}

          {/* Safe spacing at bottom */}
          <div className="h-6" />
        </div>

        {/* ── Fixed Footer & Back To Top ── */}
        <div className="shrink-0 px-4 py-3 sm:px-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="hidden sm:inline">Completed events auto-archive • Multi-year dynamic rolling calendar</span>
            <span className="sm:hidden">Auto-rolling 1–2 year calendar</span>
          </div>

          <div className="flex items-center gap-2">
            {showBackToTop && (
              <button
                onClick={scrollToTop}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-all text-xs cursor-pointer"
                title="Scroll back to top"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Top</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold transition-colors cursor-pointer shadow-2xs"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default FestivalAdvisorModal
