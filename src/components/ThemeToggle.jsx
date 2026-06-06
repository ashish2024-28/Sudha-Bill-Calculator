import React from 'react'
import { Sun, Moon } from 'lucide-react'

const ThemeToggle = ({ darkMode, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="relative w-14 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 flex items-center justify-center group"
      aria-label="Toggle dark mode"
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="transition-all duration-300 ease-spring">
        {darkMode ? (
          <Sun size={18} className="text-amber-500 rotate-0 group-hover:rotate-45 transition-transform duration-300" />
        ) : (
          <Moon size={18} className="text-slate-600 rotate-0 group-hover:-rotate-12 transition-transform duration-300" />
        )}
      </div>
    </button>
  )
}

export default ThemeToggle
