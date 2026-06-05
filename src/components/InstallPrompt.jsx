import React, { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showBanner, setShowBanner] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already dismissed recently
    const lastDismissed = localStorage.getItem('pwa_install_dismissed')
    if (lastDismissed) {
      const daysSince = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24)
      if (daysSince < 7) return // Don't show for 7 days after dismiss
    }

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowBanner(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    setDismissed(true)
    localStorage.setItem('pwa_install_dismissed', Date.now().toString())
  }

  if (!showBanner || dismissed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 animate-slide-up">
      <div className="card p-4 shadow-2xl border border-blue-100 dark:border-blue-800 bg-white dark:bg-slate-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
            <Smartphone size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-sm text-slate-800 dark:text-slate-100">
              Install App
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Add Sudha Bill to your home screen for offline access
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInstall}
            className="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-1.5"
          >
            <Download size={14} />
            Install Now
          </button>
          <button
            onClick={handleDismiss}
            className="btn-secondary text-sm py-2 px-4"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  )
}

export default InstallPrompt
