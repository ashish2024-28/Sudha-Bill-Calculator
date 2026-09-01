import React, { useState } from 'react'

export const ShareReceiptModal = ({
  isOpen,
  onClose,
  imageSrc,
  imageBlob,
  fileName,
  tabName,
  selectedDate,
  effectiveSupplyDate,
  finalAfterLess,
  textSummary,
}) => {
  const [copyMsg, setCopyMsg] = useState('')
  const [isSharing, setIsSharing] = useState(false)

  if (!isOpen || !imageSrc) return null

// Universal image share function: ensures the screenshot PNG image is shared across all browsers and devices
  const handleShareImage = async () => {
    if (!imageBlob) return
    setIsSharing(true)
    setCopyMsg('📸 Sharing screenshot image...')

    try {
      const file = new File([imageBlob], fileName || `${tabName.replace(/\s+/g, '_')}_bill.png`, {
        type: 'image/png',
        lastModified: Date.now(),
      })

      // 1. Modern Web Share API with image file
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${tabName} Order Receipt`,
          files: [file],
        })
        setCopyMsg('✓ Screenshot shared successfully!')
        setTimeout(() => setCopyMsg(''), 3000)
        return
      }

      // 2. Clipboard fallback (Direct image copy so user can paste the actual picture into WhatsApp / chat)
      if (typeof navigator !== 'undefined' && navigator.clipboard && window.ClipboardItem) {
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': imageBlob })])
          setCopyMsg('✓ Screenshot image copied! Long-press & Paste in WhatsApp/Chat')
          
          // Open WhatsApp if on mobile or desktop so user can immediately paste the picture
          const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '')
          setTimeout(() => {
            if (isMobile) {
              window.location.href = 'whatsapp://send'
            } else {
              window.open('https://web.whatsapp.com', '_blank')
            }
          }, 800)
          return
        } catch (clipErr) {
          console.warn('Clipboard image write failed:', clipErr)
        }
      }

      // 3. Fallback for non-HTTPS local IP or unsupported browsers:
      // Trigger instant direct image download so the image file is ready to send
      handleDownload()
      setCopyMsg('✓ Image downloaded! Select and send from gallery')
    } catch (err) {
      if (err && err.name !== 'AbortError') {
        console.warn('Share error:', err)
        handleDownload()
        setCopyMsg('✓ Image downloaded! Select and send from gallery')
      }
    } finally {
      setIsSharing(false)
      setTimeout(() => setCopyMsg(''), 4000)
    }
  }

  const handleDownload = () => {
    if (!imageSrc) return
    const link = document.createElement('a')
    link.download = fileName || 'dairy_order_bill.png'
    link.href = imageSrc
    link.click()
    setCopyMsg('✓ Image saved to Downloads!')
    setTimeout(() => setCopyMsg(''), 3000)
  }

  const handleCopyImage = async () => {
    if (!imageBlob) return
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': imageBlob })])
        setCopyMsg('✓ Screenshot Copied to Clipboard!')
      } else {
        setCopyMsg('⚠️ Clipboard image copy not supported on this browser')
      }
    } catch (err) {
      console.warn('Clipboard write failed:', err)
      setCopyMsg('⚠️ Please use WhatsApp / Download button')
    }
    setTimeout(() => setCopyMsg(''), 3000)
  }

  const handleCopyText = async () => {
    if (!textSummary) return
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(textSummary)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = textSummary
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      setCopyMsg('✓ Text Summary Copied!')
      setTimeout(() => setCopyMsg(''), 3000)
    } catch {
      setCopyMsg('Failed to copy text')
      setTimeout(() => setCopyMsg(''), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-scaleUp">
        
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">📸</span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Screenshot Preview
              </h2>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {tabName} • ₹{finalAfterLess}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* ── Status Toast ── */}
        {copyMsg && (
          <div className="bg-emerald-500 text-white text-xs font-bold py-2 px-4 text-center animate-fadeIn shadow-sm">
            {copyMsg}
          </div>
        )}

        {/* ── Scrollable Image Preview (Clear & Zoomable) ── */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-slate-100 dark:bg-slate-950 flex flex-col items-center">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 text-center">
            🔍 Check the receipt details below before sharing:
          </p>
          <div className="w-full max-w-md rounded-xl overflow-hidden shadow-lg border border-slate-300 dark:border-slate-700 bg-white">
            <img
              src={imageSrc}
              alt="Dairy Order Bill Screenshot"
              className="w-full h-auto block select-none"
              style={{ minHeight: '200px' }}
            />
          </div>
        </div>

        {/* ── Action Buttons Footer ── */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col gap-2.5">
          
          {/* Primary Action: Share Screenshot Image */}
          <button
            onClick={handleShareImage}
            disabled={isSharing}
            className="w-full py-3.5 px-4 rounded-xl text-base font-black bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span className="text-xl">📸</span>
            <span>{isSharing ? 'Sharing Image...' : 'Share Screenshot Image (WhatsApp / Apps)'}</span>
          </button>

          {/* Secondary Actions Grid */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleDownload}
              className="py-2.5 px-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Download image to device"
            >
              <span>💾</span>
              <span>Download</span>
            </button>

            <button
              onClick={handleCopyImage}
              className="py-2.5 px-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Copy image to clipboard"
            >
              <span>📋</span>
              <span>Copy Pic</span>
            </button>

            <button
              onClick={handleCopyText}
              className="py-2.5 px-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Copy text summary"
            >
              <span>📝</span>
              <span>Copy Text</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

