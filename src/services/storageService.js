const SETTINGS_KEY = 'sudha_bill_calculator_settings'
const HISTORY_KEY = 'dairy_history_v4'
const DRAFT_KEY = 'sudha_bill_active_draft_v5'
const CUSTOM_DAIRIES_KEY = 'sudha_bill_custom_dairies_v1'
const CUSTOM_FESTIVALS_KEY = 'sudha_bill_custom_festivals_v1'

const DEFAULT_CUSTOM_DAIRIES = [
  { id: 'otherdairy', name: 'Namaste India', createdAt: Date.now() }
]

export const storageService = {
  getCustomFestivals() {
    try {
      const data = localStorage.getItem(CUSTOM_FESTIVALS_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to load custom festivals:', error)
      return []
    }
  },

  saveCustomFestivals(festivals) {
    try {
      localStorage.setItem(CUSTOM_FESTIVALS_KEY, JSON.stringify(festivals))
      return true
    } catch (error) {
      console.error('Failed to save custom festivals:', error)
      return false
    }
  },

  addCustomFestival(fest) {
    try {
      const list = this.getCustomFestivals()
      const newEntry = {
        ...fest,
        id: fest.id || `custom_fest_${Date.now()}`,
        isCustom: true,
        createdAt: Date.now()
      }
      const updated = [newEntry, ...list.filter(f => f.id !== newEntry.id)]
      this.saveCustomFestivals(updated)
      return updated
    } catch (error) {
      console.error('Failed to add custom festival:', error)
      return []
    }
  },

  deleteCustomFestival(festId) {
    try {
      const list = this.getCustomFestivals()
      const updated = list.filter(f => f.id !== festId)
      this.saveCustomFestivals(updated)
      return updated
    } catch (error) {
      console.error('Failed to delete custom festival:', error)
      return []
    }
  },
  getCustomDairies() {
    try {
      const data = localStorage.getItem(CUSTOM_DAIRIES_KEY)
      if (data) {
        let parsed = JSON.parse(data)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Gracefully migrate legacy 'Other Dairy 1' placeholder to 'Namaste India'
          const migrated = parsed.map(d => (d.name === 'Other Dairy 1' ? { ...d, name: 'Namaste India' } : d))
          return migrated
        }
      }
      this.saveCustomDairies(DEFAULT_CUSTOM_DAIRIES)
      return DEFAULT_CUSTOM_DAIRIES
    } catch (error) {
      console.error('Failed to load custom dairies:', error)
      return DEFAULT_CUSTOM_DAIRIES
    }
  },

  saveCustomDairies(dairies) {
    try {
      localStorage.setItem(CUSTOM_DAIRIES_KEY, JSON.stringify(dairies))
      return true
    } catch (error) {
      console.error('Failed to save custom dairies:', error)
      return false
    }
  },

  deleteCustomDairy(dairyId) {
    try {
      // 1. Delete history entries for this dairy
      this.deleteAllHistoryForTab(dairyId)

      // 2. Remove draft entry for this dairy
      const draft = this.getActiveDraft()
      if (draft && draft.tabData && draft.tabData[dairyId]) {
        delete draft.tabData[dairyId]
        this.saveActiveDraft(draft)
      }

      // 3. Update custom dairies list
      let list = this.getCustomDairies().filter(d => d.id !== dairyId)
      if (list.length === 0) {
        list = [{ id: 'otherdairy_cd_' + Date.now(), name: 'Namaste India', createdAt: Date.now() }]
      }
      this.saveCustomDairies(list)
      return list
    } catch (error) {
      console.error('Failed to delete custom dairy:', error)
      return null
    }
  },
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
  },

  // ─── Storage & Memory Usage Analytics ──────────────────────────────────
  getStorageStats() {
    try {
      let totalBytes = 0
      let historyBytes = 0
      let historyCount = 0
      let draftBytes = 0
      let dairiesBytes = 0
      let dairiesCount = 0
      let productsBytes = 0
      let settingsBytes = 0
      let otherBytes = 0

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (!key) continue
        const val = localStorage.getItem(key) || ''
        const bytes = new Blob([key, val]).size

        totalBytes += bytes

        if (key === HISTORY_KEY || key === 'dairy_last_less_amt' || key.startsWith('dairy_history')) {
          historyBytes += bytes
          if (key === HISTORY_KEY) {
            try {
              const parsed = JSON.parse(val)
              historyCount = Object.keys(parsed).length
            } catch { }
          }
        } else if (key === DRAFT_KEY || key.includes('active_draft')) {
          draftBytes += bytes
        } else if (key === CUSTOM_DAIRIES_KEY || key.includes('custom_dairies')) {
          dairiesBytes += bytes
          try {
            const parsed = JSON.parse(val)
            dairiesCount = Array.isArray(parsed) ? parsed.length : 0
          } catch { }
        } else if (key.includes('products')) {
          productsBytes += bytes
        } else if (key === SETTINGS_KEY || key.includes('theme') || key.includes('pwa') || key.includes('dismissed')) {
          settingsBytes += bytes
        } else {
          otherBytes += bytes
        }
      }

      // Standard browser LocalStorage quota is ~5MB (5,242,880 bytes)
      const quotaBytes = 5 * 1024 * 1024
      const percentUsed = (totalBytes / quotaBytes) * 100

      const formatBytes = (b) => {
        if (b === 0) return '0 B'
        if (b < 1024) return `${b} B`
        if (b < 1024 * 1024) return `${(b / 1024).toFixed(2)} KB`
        return `${(b / (1024 * 1024)).toFixed(2)} MB`
      }

      return {
        totalBytes,
        totalFormatted: formatBytes(totalBytes),
        quotaBytes,
        quotaFormatted: '5.0 MB',
        percentUsed: Number(percentUsed.toFixed(1)),
        items: [
          {
            label: 'Saved Order History',
            key: 'history',
            bytes: historyBytes,
            formatted: formatBytes(historyBytes),
            detail: `${historyCount} saved ${historyCount === 1 ? 'record' : 'records'}`
          },
          {
            label: 'Active Order Draft',
            key: 'draft',
            bytes: draftBytes,
            formatted: formatBytes(draftBytes),
            detail: draftBytes > 0 ? 'Live auto-saved' : 'Empty'
          },
          {
            label: 'Custom Dairies',
            key: 'dairies',
            bytes: dairiesBytes,
            formatted: formatBytes(dairiesBytes),
            detail: `${dairiesCount} custom ${dairiesCount === 1 ? 'dairy' : 'dairies'}`
          },
          {
            label: 'Custom Products & Prices',
            key: 'products',
            bytes: productsBytes,
            formatted: formatBytes(productsBytes),
            detail: 'Catalog & unit rates'
          },
          {
            label: 'App Settings & Theme',
            key: 'settings',
            bytes: settingsBytes,
            formatted: formatBytes(settingsBytes),
            detail: 'Preferences & UI'
          },
          {
            label: 'Other App Cache',
            key: 'other',
            bytes: otherBytes,
            formatted: formatBytes(otherBytes),
            detail: 'Local storage cache'
          }
        ]
      }
    } catch (e) {
      console.error('Failed to calculate storage stats:', e)
      return {
        totalBytes: 0,
        totalFormatted: '0 KB',
        quotaBytes: 5 * 1024 * 1024,
        quotaFormatted: '5.0 MB',
        percentUsed: 0,
        items: []
      }
    }
  }
}
