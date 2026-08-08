import React, { useState, useRef, useEffect } from 'react'
import { Calculator, History, Info, Menu, X, Clock, Sparkles, Moon, Sun, ChevronDown } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import VersionPicker from './VersionPicker'

const Header = ({ darkMode, onToggleDarkMode, onOpenLogs, onOpenAbout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
            {/* Version Switcher Dropdown */}
            <VersionPicker />

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
                className="w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all duration-200 shrink-0"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Dropdown Menu Panel */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Navigation & Tools
                    </p>
                  </div>

                  <div className="p-1.5 space-y-1">
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
                          <div>All Version History</div>
                          <div className="text-[11px] font-normal text-slate-400">v5.2.0 to v1.0.0 logs</div>
                        </div>
                      </button>
                    )}

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
                          <div className="text-[11px] font-normal text-slate-400">Features & App Info</div>
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

