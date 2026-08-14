import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Calculator, History, Info, Menu, X, Clock, Sparkles, ChevronDown, Tag, Check, ExternalLink, Flame } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { VERSION_LIST, CURRENT_VERSION_ID } from '../versions'
import { getFestivalAdvisor } from '../data/festivalCalendar'

const Header = ({ darkMode, onToggleDarkMode, onOpenLogs, onOpenAbout, onOpenFestivalAdvisor }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVersionSubmenuOpen, setIsVersionSubmenuOpen] = useState(false)
  const menuRef = useRef(null)

  const currentVersion = VERSION_LIST.find(v => v.id === CURRENT_VERSION_ID) || VERSION_LIST[0]

  // Check if any festival is 0, 1, or 2 days away today
  const advisor = useMemo(() => {
    try {
      return getFestivalAdvisor()
    } catch {
      return { hasActiveAlert: false, activeAlerts: [] }
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false)
        setIsVersionSubmenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handlePickVersion = (v) => {
    setIsMenuOpen(false)
    if (v.id === CURRENT_VERSION_ID) return
    window.location.href = v.url
  }

  return (
    <header className="sticky top-0 z-50 glass dark:glass-dark border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Calculator size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg sm:text-2xl text-slate-900 dark:text-white leading-none">
                Sudha Bill
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-body leading-none mt-0.5 hidden sm:block">
                Discount Calculator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3" ref={menuRef}>
            {/* Festival & Demand Advisor Quick Button on Desktop */}
            {onOpenFestivalAdvisor && (
              <button
                onClick={onOpenFestivalAdvisor}
                title="Festival & Milk Demand Advisor"
                className={`relative hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  advisor.hasActiveAlert
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-sm animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                <span className="text-sm">🎉</span>
                <span>Festival Demand</span>
                {advisor.hasActiveAlert && (
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping absolute -top-0.5 -right-0.5" />
                )}
              </button>
            )}

            {/* Direct Quick Action Buttons for Desktop */}
            {onOpenAbout && (
              <button
                onClick={onOpenAbout}
                title="App Info & Version History"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200"
              >
                <Info className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Versions & Info</span>
              </button>
            )}

            {onOpenLogs && (
              <button
                onClick={onOpenLogs}
                title="Activity Logs & Change History"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200"
              >
                <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Activity Logs</span>
              </button>
            )}

            {/* Main Unified Dropdown Menu Button */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(prev => !prev)}
                title="Main Menu"
                aria-label="Main Menu"
                className={`w-10 h-10 flex items-center justify-center text-white rounded-xl shadow-md transition-all duration-200 shrink-0 relative ${
                  advisor.hasActiveAlert
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-orange-500/30'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                }`}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                {advisor.hasActiveAlert && !isMenuOpen && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full animate-bounce" />
                )}
              </button>

              {/* Dropdown Menu Panel */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-fadeIn max-h-[85vh] overflow-y-auto">
                  {/* Header in Menu */}
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      App Menu & Tools
                    </p>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                      Active: {currentVersion.id}
                    </span>
                  </div>

                  <div className="p-2 space-y-1.5">
                    {/* Festival Reminders Option */}
                    {onOpenFestivalAdvisor && (
                      <button
                        onClick={() => {
                          onOpenFestivalAdvisor()
                          setIsMenuOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors text-left ${
                          advisor.hasActiveAlert
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <div className="p-1.5 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-lg text-base">
                          🎉
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold">Festival Reminders</span>
                            {advisor.hasActiveAlert && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-orange-500 text-white font-extrabold uppercase">
                                Alert
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                            {advisor.hasActiveAlert && advisor.primaryAlert
                              ? `${advisor.primaryAlert.timingLabel}: ${advisor.primaryAlert.name}`
                              : 'Upcoming festivals & advance calendar'}
                          </div>
                        </div>
                      </button>
                    )}

                    {/* Switch App Version Section */}
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700/60">
                      <button
                        onClick={() => setIsVersionSubmenuOpen(v => !v)}
                        className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200"
                      >
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Switch App Version</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 font-mono">
                            {currentVersion.label}
                          </span>
                          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isVersionSubmenuOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      {/* Versions list */}
                      {isVersionSubmenuOpen && (
                        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1 animate-fadeIn">
                          {VERSION_LIST.map((v, idx) => {
                            const isCurrent = v.id === CURRENT_VERSION_ID
                            return (
                              <button
                                key={v.id}
                                onClick={() => handlePickVersion(v)}
                                className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors flex items-center justify-between text-xs ${
                                  isCurrent
                                    ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate pr-2">
                                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                                    idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-blue-500' : 'bg-slate-400'
                                  }`} />
                                  <span className="truncate">{v.label}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {v.isLatest && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wide">
                                      Latest
                                    </span>
                                  )}
                                  {isCurrent ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  ) : (
                                    <ExternalLink className="w-3 h-3 text-slate-400 opacity-60" />
                                  )}
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* All Version History Button */}
                    {onOpenAbout && (
                      <button
                        onClick={() => {
                          onOpenAbout()
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                      >
                        <div className="p-1.5 bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-lg">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <div>All Version History & Changelog</div>
                          <div className="text-[11px] font-normal text-slate-400">View release notes & features</div>
                        </div>
                      </button>
                    )}

                    {/* Activity Logs Button */}
                    {onOpenLogs && (
                      <button
                        onClick={() => {
                          onOpenLogs()
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                      >
                        <div className="p-1.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
                          <History className="w-4 h-4" />
                        </div>
                        <div>
                          <div>Activity Logs</div>
                          <div className="text-[11px] font-normal text-slate-400">Track all edit changes</div>
                        </div>
                      </button>
                    )}

                    {/* About Web App Button */}
                    {onOpenAbout && (
                      <button
                        onClick={() => {
                          onOpenAbout()
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                      >
                        <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div>About Web App</div>
                          <div className="text-[11px] font-normal text-slate-400">Features & Architecture</div>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Light / Dark Mode Toggle Button on the far right */}
            <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header



