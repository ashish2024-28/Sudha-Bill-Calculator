const SETTINGS_KEY = 'sudha_bill_calculator_settings'
const HISTORY_KEY = 'dairy_history_v4'
const DRAFT_KEY = 'sudha_bill_active_draft_v5'
const LOGS_KEY = 'sudha_bill_activity_logs_v1'

export const storageService = {
  getProducts(key = 'sudha_bill_patandairy_products') {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to load products:', error)
      return []
    }
  },

  saveProducts(products, key = 'sudha_bill_patandairy_products') {
    try {
      localStorage.setItem(key, JSON.stringify(products))
      return true
    } catch (error) {
      console.error('Failed to save products:', error)
      return false
    }
  },

  clearProducts(key = 'sudha_bill_patandairy_products') {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Failed to clear products:', error)
      return false
    }
  },

  getSettings() {
    try {
      const data = localStorage.getItem(SETTINGS_KEY)
      return data ? JSON.parse(data) : { darkMode: false, currency: '₹' }
    } catch (error) {
      return { darkMode: false, currency: '₹' }
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
      return true
    } catch (error) {
      console.error('Failed to save settings:', error)
      return false
    }
  },

  // ─── Active Draft Persistence (Auto-Save on every change) ────────────────
  getActiveDraft() {
    try {
      const data = localStorage.getItem(DRAFT_KEY)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to load active draft:', error)
      return null
    }
  },

  saveActiveDraft(draftData) {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        ...draftData,
        lastUpdated: new Date().toISOString()
      }))
      return true
    } catch (error) {
      console.error('Failed to save active draft:', error)
      return false
    }
  },

  clearActiveDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY)
      return true
    } catch (error) {
      console.error('Failed to clear active draft:', error)
      return false
    }
  },

  // ─── Activity History & Change Logs ──────────────────────────────────────
  getActivityLogs() {
    try {
      const data = localStorage.getItem(LOGS_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to load activity logs:', error)
      return []
    }
  },

  addActivityLog(log) {
    try {
      const logs = this.getActivityLogs()
      const newEntry = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toISOString(),
        tab: log.tab || 'General',
        action: log.action || 'Update',
        details: log.details || '',
        type: log.type || 'info', // 'info', 'update', 'save', 'delete', 'restore'
      }
      // Keep up to 200 most recent logs
      const updated = [newEntry, ...logs].slice(0, 200)
      localStorage.setItem(LOGS_KEY, JSON.stringify(updated))
      return newEntry
    } catch (error) {
      console.error('Failed to add activity log:', error)
      return null
    }
  },

  clearActivityLogs() {
    try {
      localStorage.removeItem(LOGS_KEY)
      return true
    } catch (error) {
      console.error('Failed to clear activity logs:', error)
      return false
    }
  },

  exportToJSON(products) {
    const data = {
      exportedAt: new Date().toISOString(),
      appName: 'Sudha Bill Calculator',
      version: '1.0.0',
      products
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sudha-bill-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },

  importFromJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          if (data.products && Array.isArray(data.products)) {
            resolve(data.products)
          } else if (Array.isArray(data)) {
            resolve(data)
          } else {
            reject(new Error('Invalid file format'))
          }
        } catch {
          reject(new Error('Failed to parse JSON file'))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  },

  getHistory() {
    try {
      const data = localStorage.getItem(HISTORY_KEY)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error('Failed to load history:', error)
      return {}
    }
  },

  saveHistory(history) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
      return true
    } catch (error) {
      console.error('Failed to save history:', error)
      return false
    }
  },

  deleteHistoryEntry(tabKey, dateStr) {
    try {
      const h = this.getHistory()
      delete h[tabKey + '_' + dateStr]
      this.saveHistory(h)
      return true
    } catch (error) {
      console.error('Failed to delete history entry:', error)
      return false
    }
  },

  deleteAllHistoryForTab(tabKey) {
    try {
      const h = this.getHistory()
      Object.keys(h).filter(k => k.startsWith(tabKey + '_')).forEach(k => delete h[k])
      this.saveHistory(h)
      return true
    } catch (error) {
      console.error('Failed to delete all history:', error)
      return false
    }
  },

  deleteHistoryRange(tabKey, dateFrom, dateTo) {
    try {
      const h = this.getHistory()
      Object.keys(h)
        .filter(k => k.startsWith(tabKey + '_'))
        .forEach(k => {
          const date = k.replace(tabKey + '_', '')
          if (date >= dateFrom && date <= dateTo) delete h[k]
        })
      this.saveHistory(h)
      return true
    } catch (error) {
      console.error('Failed to delete history range:', error)
      return false
    }
  },

  deleteHistoryBySerial(tabKey, serialNo) {
    try {
      const h = this.getHistory()
      const keys = Object.keys(h)
        .filter(k => k.startsWith(tabKey + '_'))
        .sort((a, b) => b.localeCompare(a))  // newest first
      const idx = serialNo - 1
      if (idx < 0 || idx >= keys.length) return false
      delete h[keys[idx]]
      this.saveHistory(h)
      return true
    } catch (error) {
      console.error('Failed to delete history by serial:', error)
      return false
    }
  }
}
