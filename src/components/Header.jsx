import React from 'react'
import { Calculator, ShoppingCart } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const Header = ({ darkMode, onToggleDarkMode }) => {
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

          {/* Stats Badges */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Theme Toggle */}
            <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
