import React, { useState } from 'react'
import Header from './components/Header'
import { useTheme } from './hooks/useTheme'
import InstallPrompt from './components/InstallPrompt'
import ExportImport from './components/ExportImport'
import DairyOrderTable from './components/DairyOrderTable'
import UpdateToast from './components/UpdateToast'
import ActivityLogModal from './components/ActivityLogModal'
import AboutVersionDrawer from './components/AboutVersionDrawer'

function App() {
  const { darkMode, toggleDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('patandairy')
  const [isLogsOpen, setIsLogsOpen] = useState(false)
  const [isAboutOpen, setIsAboutOpen] = useState(false)

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <InstallPrompt />
      <UpdateToast />

      <Header
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenLogs={() => setIsLogsOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
        {/* Tab switcher */}
        <div className="flex flex-wrap sm:flex-nowrap gap-1.5 sm:gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full sm:w-fit">
          {[
            { key: 'patandairy', label: '🐄 Patna Dairy' },
            { key: 'arradairy',  label: '🥛 Arra Dairy'  },
            { key: 'otherdairy', label: '🍶 Other Dairy' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm sm:text-base font-semibold font-display transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dairy Order Table */}
        <DairyOrderTable
          key={activeTab}
          tabName={activeTab === 'patandairy' ? '🐄 Patna Dairy' : activeTab === 'arradairy' ? '🥛 Arra Dairy' : '🍶 Other Dairy'}
          tabKey={activeTab}
          onOpenLogs={() => setIsLogsOpen(true)}
        />

        <ExportImport />

        {/* Activity Log Modal */}
        <ActivityLogModal
          isOpen={isLogsOpen}
          onClose={() => setIsLogsOpen(false)}
        />

        {/* About & Version Drawer */}
        <AboutVersionDrawer
          isOpen={isAboutOpen}
          onClose={() => setIsAboutOpen(false)}
        />

        {/* Footer */}
        <footer className="text-center py-6 text-xs text-slate-400 dark:text-slate-500 font-body">
          <p>Sudha Bill Calculator • Offline-First PWA • Auto-Saved Local Storage & Change Logs</p>
        </footer>
      </main>
    </div>
  )
}

export default App
