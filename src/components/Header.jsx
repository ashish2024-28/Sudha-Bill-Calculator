import React, { useMemo } from 'react'
import { Calculator, Sparkles, Info } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { getFestivalAdvisor } from '../data/festivalCalendar'

const Header = ({ darkMode, onToggleDarkMode, onOpenFestivalAdvisor, onOpenAbout }) => {
  // Check if any festival is 0, 1, or 2 days away today
  const advisor = useMemo(() => {
    try {
      return getFestivalAdvisor()
    } catch {
      return { hasActiveAlert: false, activeAlerts: [] }
    }
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

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Festival & Demand Advisor Quick Button */}
            {onOpenFestivalAdvisor && (
              <button
                id="header-festival-btn"
                onClick={onOpenFestivalAdvisor}
                title="Festival & Milk Demand Advisor"
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  advisor.hasActiveAlert
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-sm animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                <span className="text-sm">🎉</span>
                <span className="hidden xs:inline sm:inline">Festival Demand</span>
                {advisor.hasActiveAlert && (
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping absolute -top-0.5 -right-0.5" />
                )}
              </button>
            )}

            {/* About Application Button */}
            {onOpenAbout && (
              <button
                id="header-about-btn"
                onClick={onOpenAbout}
                title="About Sudha Bill Calculator"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60"
              >
                <Info size={16} className="text-blue-600 dark:text-blue-400" />
                <span className="hidden xs:inline sm:inline">About</span>
              </button>
            )}

            {/* Light / Dark Mode Toggle Button */}
            <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header



