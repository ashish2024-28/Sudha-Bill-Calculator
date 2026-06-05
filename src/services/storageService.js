const STORAGE_KEY = 'sudha_bill_calculator_products'
const SETTINGS_KEY = 'sudha_bill_calculator_settings'

export const storageService = {
  // Products
  getProducts() {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to load products:', error)
      return []
    }
  },

  saveProducts(products) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
      return true
    } catch (error) {
      console.error('Failed to save products:', error)
      return false
    }
  },

  clearProducts() {
    try {
      localStorage.removeItem(STORAGE_KEY)
      return true
    } catch (error) {
      console.error('Failed to clear products:', error)
      return false
    }
  },

  // Settings
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

  // Export / Import
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
  }
}
