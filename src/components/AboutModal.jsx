import React from 'react'
import { Info, X, CheckCircle2, Calendar, Truck, ShieldCheck, Sparkles, Database, FileSpreadsheet, Smartphone } from 'lucide-react'

const AboutModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div
      id="about-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target.id === 'about-modal-backdrop') onClose()
      }}
    >
      <div
        id="about-modal-container"
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl shadow-inner">
              🥛
            </div>
            <div>
              <h2 className="font-bold text-lg sm:text-xl text-white">About Sudha Bill Calculator</h2>
              <p className="text-xs text-blue-100 font-medium">Complete application overview & guide</p>
            </div>
          </div>
          <button
            id="about-modal-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-200 text-sm">
          {/* Overview Section */}
          <div className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 rounded-2xl p-4 sm:p-5">
            <h3 className="font-bold text-base text-blue-900 dark:text-blue-200 flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Application Overview
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>Sudha Bill Calculator</strong> is an offline-first, high-precision billing and order management application built for dairy booth operators, milk distributors, and retailers. It automates packet calculations, per-litre/per-pack discount rules, extra milk additions, multi-day order tracking, and advance festival demand estimation.
            </p>
          </div>

          {/* Key Features Grid */}
          <div className="space-y-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Core Capabilities & Features
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Feature 1 */}
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                  <span className="text-base">🐄</span>
                  <span>Multi-Dairy Tab Support</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Pre-configured tabs for <strong>Patna Dairy</strong> and <strong>Arra Dairy</strong>, plus an <strong>Other Dairy Manager</strong> to create, rename, and manage custom dairy suppliers.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                  <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Order & Supply Dates (🚚)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Dual-date tracking: place orders on today’s date with automated supply delivery scheduled for the next morning (or custom date).
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                  <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span>Festival Demand Advisor</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Includes a comprehensive festival calendar (Chhath Puja, Diwali, Eid, Holi, etc.) with 1–3 day advance surge warnings to plan stock.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Offline Storage & Auto-Draft</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Works 100% offline without internet. Live inputs are auto-saved to localStorage with navigation protection against accidental loss.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                  <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>History & S.No Management</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Save daily bills with automatic S.No ordering. Includes quick bill restore, S.No range deletion, and top-record retention tools.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                  <FileSpreadsheet className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Share, PDF & JSON Backup</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Export printer-friendly summary invoices (Print/PDF), share neat text messages via WhatsApp, and backup full product settings to JSON.
                </p>
              </div>
            </div>
          </div>

          {/* Quick How-to Guide */}
          <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 sm:p-5 space-y-2">
            <h3 className="font-bold text-base text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <span className="text-base">💡</span>
              Quick Tips for Operators
            </h3>
            <ul className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
              <li>
                Click <strong>✏ Edit orders</strong> to enter morning quantities directly with the touch-friendly keypad.
              </li>
              <li>
                Click <strong>⚙ Modify</strong> to customize product names, base rates, and individual discount amounts.
              </li>
              <li>
                For <strong>Dahi 400g</strong>, always enter even numbers (2, 4, 6 kg) since 1 kg corresponds to exactly 2.5 packets.
              </li>
              <li>
                Use <strong>💳 Online Payment</strong> to split receivables between online UPI and cash offline.
              </li>
              <li>
                Click <strong>💾 Save</strong> to preserve the day’s bill. Overwrite protection will notify you if a bill for the date already exists.
              </li>
            </ul>
          </div>

          {/* Technical Info */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-slate-400" />
              <span>Offline-First Progressive Web App (PWA)</span>
            </div>
            <span>v1.0.0 • Local Storage Engine</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-700 flex justify-end shrink-0">
          <button
            id="about-modal-done-btn"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default AboutModal
