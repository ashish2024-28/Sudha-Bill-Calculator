import React, { useState } from 'react'
import Header from './components/Header'
import { useTheme } from './hooks/useTheme'
import InstallPrompt from './components/InstallPrompt'
import ExportImport from './components/ExportImport'
import DairyOrderTable from './components/DairyOrderTable'
import OtherDairyManager from './components/OtherDairyManager'
import UpdateToast from './components/UpdateToast'
import ActivityLogModal from './components/ActivityLogModal'
import AboutVersionDrawer from './components/AboutVersionDrawer'
import FestivalDemandBanner from './components/FestivalDemandBanner'
import FestivalAdvisorModal from './components/FestivalAdvisorModal'
import StorageFooter from './components/StorageFooter'

function App() {
  const { darkMode, toggleDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('patandairy')
  const [isLogsOpen, setIsLogsOpen] = useState(false)
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [isFestivalAdvisorOpen, setIsFestivalAdvisorOpen] = useState(false)

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
        onOpenFestivalAdvisor={() => setIsFestivalAdvisorOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-4 sm:space-y-6 pb-28 sm:pb-8">
        {/* Festive Demand Advisor Banner (Alerts 0-3 days before festivals) */}
        <FestivalDemandBanner
          onOpenAdvisor={() => setIsFestivalAdvisorOpen(true)}
        />

        {/* Mobile-First Tab Switcher: Full width on phones with large 48px touch targets */}
        <div className="grid grid-cols-3 sm:flex sm:flex-nowrap gap-1 sm:gap-2 p-1 sm:p-1.5 bg-slate-200/70 dark:bg-slate-800 rounded-2xl w-full sm:w-fit shadow-2xs">
          {[
            { key: 'patandairy', label: 'Patna Dairy', icon: '🐄' },
            { key: 'arradairy',  label: 'Arra Dairy',  icon: '🥛' },
            { key: 'otherdairy', label: 'Other Dairy', icon: '🍶' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-2.5 sm:py-2.5 rounded-xl text-xs sm:text-base font-bold font-display transition-all duration-200 min-h-[44px] sm:min-h-0 select-none ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span className="text-sm sm:text-base">{tab.icon}</span>
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dairy Order Table or Other Dairy Manager */}
        {activeTab === 'otherdairy' ? (
          <OtherDairyManager
            onOpenLogs={() => setIsLogsOpen(true)}
            onOpenFestivalAdvisor={() => setIsFestivalAdvisorOpen(true)}
          />
        ) : (
          <DairyOrderTable
            key={activeTab}
            tabName={activeTab === 'patandairy' ? '🐄 Patna Dairy' : '🥛 Arra Dairy'}
            tabKey={activeTab}
            onOpenLogs={() => setIsLogsOpen(true)}
            onOpenFestivalAdvisor={() => setIsFestivalAdvisorOpen(true)}
          />
        )}

        <ExportImport />

        {/* Storage & Memory Monitor in Footer */}
        <StorageFooter />

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

        {/* Festival & Demand Advisor Modal */}
        <FestivalAdvisorModal
          isOpen={isFestivalAdvisorOpen}
          onClose={() => setIsFestivalAdvisorOpen(false)}
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

