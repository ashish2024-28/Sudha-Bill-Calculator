import { useState, useEffect } from 'react'
import { storageService } from '../services/storageService'

export const useTheme = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const settings = storageService.getSettings()
    return settings.darkMode ?? window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    const settings = storageService.getSettings()
    storageService.saveSettings({ ...settings, darkMode })
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode(prev => !prev)

  return { darkMode, toggleDarkMode }
}
