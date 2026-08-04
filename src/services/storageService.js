const SETTINGS_KEY = 'sudha_bill_calculator_settings'
const HISTORY_KEY = 'dairy_history_v4'

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

// add these inside storageService object, after importFromJSON:

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