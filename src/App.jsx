import React, { useState, useCallback } from 'react'
import Header from './components/Header'
import { useTheme } from './hooks/useTheme'
import InstallPrompt from './components/InstallPrompt'
import ExportImport from './components/ExportImport'
import DairyOrderTable from './components/DairyOrderTable'
import UpdateToast from './components/UpdateToast'

function App() {
  const { darkMode, toggleDarkMode } = useTheme()

  const [activeTab, setActiveTab] = useState('patandairy')

  const [editingProduct, setEditingProduct] = useState(null)

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setEditingProduct(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      
      <InstallPrompt />
      <UpdateToast />
  
      <Header
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Tab switcher ── */}
        {/* NOTE: modifyMode and editMode are now managed INSIDE DairyOrderTable,
            so no Modify button needed here. Just the tab switcher. */}
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
          {[
            { key: 'patandairy', label: '🐄 Patna Dairy' },
            { key: 'arradairy',  label: '🥛 Arra Dairy'  },
            { key: 'otherdairy',  label: '🍶 Other Dairy'  },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold font-display transition-all duration-200
                ${activeTab === tab.key
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
             <span className='text-xl'>{tab.label}</span> 
            </button>
          ))}
        </div>

        {/* ── Dairy Order Table
              Key prop forces a fresh mount when switching tabs so each tab
              gets its own independent modifyMode / editMode / showExtraTable state.
              Tab data itself is stored inside DairyOrderTable keyed by tabKey. ── */}
        <DairyOrderTable
          key={activeTab}
          tabName={activeTab === 'patandairy' ? '🐄 Patan Dairy' : activeTab === 'arradairy' ? '🥛 Arra Dairy' : '🍶 Other Dairy'}
          tabKey={activeTab}
        />

       <ExportImport />
        
        {/* Footer */}
        <footer className="text-center py-6 text-xs text-slate-400 dark:text-slate-500 font-body">
          <p>Sudha Bill Calculator • Offline-First PWA • Data stored locally on your device</p>
        </footer>
      </main>


      <InstallPrompt />

       <UpdateToast />

       

    </div>

  )
}

export default App