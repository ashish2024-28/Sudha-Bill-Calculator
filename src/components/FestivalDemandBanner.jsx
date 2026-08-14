import React, { useState } from 'react'
import { Calendar, Bell, ArrowRight, X } from 'lucide-react'
import { getFestivalAdvisor } from '../data/festivalCalendar'

const FestivalDemandBanner = ({ selectedDate, supplyDate, onOpenAdvisor }) => {
  const [isDismissed, setIsDismissed] = useState(false)

  // Target date for reminder (supply date or order date)
  const targetDate = supplyDate || selectedDate
  const reminderData = getFestivalAdvisor(targetDate)

  if (isDismissed || !reminderData.hasActiveAlert) {
    return null
  }

  const alert = reminderData.primaryAlert
  if (!alert) return null

  // Format nice human date
  const festDateParts = alert.date.split('-')
  const dateFormatted = `${festDateParts[2]}/${festDateParts[1]}/${festDateParts[0]}`

  return (
    <div
      id="festival-reminder-banner"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 dark:from-amber-600 dark:via-orange-600 dark:to-amber-700 text-white shadow-md shadow-orange-500/15 p-3 sm:p-4 transition-all duration-300 animate-fadeIn border border-amber-300/40 dark:border-amber-500/30"
    >
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        {/* Left Section: Icon & Festival reminder details */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner text-xl">
            {alert.icon || '🎉'}
          </div>
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-white text-orange-700 font-extrabold text-[11px] uppercase tracking-wider shadow-2xs">
                {alert.timingLabel}
              </span>
              <span className="font-display font-bold text-sm sm:text-base text-white">
                {alert.name} ({alert.hindiName})
              </span>
            </div>
            <p className="text-xs text-white/90 font-body flex items-center gap-1.5">
              <span>📅 Date: <strong>{dateFormatted}</strong></span>
              <span>•</span>
              <span>{alert.category}</span>
            </p>
          </div>
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            onClick={onOpenAdvisor}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-white text-orange-700 hover:bg-orange-50 font-bold text-xs sm:text-sm shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Festival List</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            title="Dismiss reminder"
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-white/90 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default FestivalDemandBanner
