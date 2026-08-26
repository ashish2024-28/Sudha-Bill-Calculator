import React, { useState, useEffect, useRef } from 'react'
import { Calendar, ArrowRight, X } from 'lucide-react'
import { getFestivalAdvisor } from '../data/festivalCalendar'

const FestivalDemandBanner = ({ selectedDate, supplyDate, onOpenAdvisor }) => {
  const [isDismissed, setIsDismissed] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const isDragging = useRef(false)

  // Target date for calculation
  const targetDate = supplyDate || selectedDate
  const reminderData = getFestivalAdvisor(targetDate)

  // Get list of up to 7 festivals
  const festivals = React.useMemo(() => {
    if (reminderData.allUpcoming && reminderData.allUpcoming.length > 0) {
      return reminderData.allUpcoming.slice(0, 7)
    }
    if (reminderData.allFestivals && reminderData.allFestivals.length > 0) {
      return reminderData.allFestivals.filter(f => f.diffDays >= -2).slice(0, 7)
    }
    return []
  }, [reminderData])

  // Reset index if out of bounds
  useEffect(() => {
    if (currentIndex >= festivals.length && festivals.length > 0) {
      setCurrentIndex(0)
    }
  }, [festivals.length, currentIndex])

  // Automatic cycle (every 4.5 seconds)
  useEffect(() => {
    if (festivals.length <= 1 || isPaused || isDismissed) return

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % festivals.length)
    }, 4500)

    return () => clearInterval(timer)
  }, [festivals.length, isPaused, isDismissed])

  if (isDismissed || festivals.length === 0) {
    return null
  }

  const currentFest = festivals[currentIndex] || festivals[0]
  if (!currentFest) return null

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + festivals.length) % festivals.length)
  }

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % festivals.length)
  }

  // Touch Swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchEndX.current = e.touches[0].clientX
    setIsPaused(true)
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (diff > 40) {
      handleNext()
    } else if (diff < -40) {
      handlePrev()
    }
    setIsPaused(false)
  }

  // Mouse Drag Swipe handlers for desktop scroll
  const handleMouseDown = (e) => {
    isDragging.current = true
    touchStartX.current = e.clientX
    touchEndX.current = e.clientX
    setIsPaused(true)
  }

  const handleMouseMove = (e) => {
    if (!isDragging.current) return
    touchEndX.current = e.clientX
  }

  const handleMouseUp = () => {
    if (!isDragging.current) return
    const diff = touchStartX.current - touchEndX.current
    if (diff > 40) {
      handleNext()
    } else if (diff < -40) {
      handlePrev()
    }
    isDragging.current = false
    setIsPaused(false)
  }

  // Format date cleanly (DD/MM/YYYY)
  const festDateParts = currentFest.date ? currentFest.date.split('-') : []
  const dateFormatted = festDateParts.length === 3
    ? `${festDateParts[2]}/${festDateParts[1]}/${festDateParts[0]}`
    : currentFest.date

  // Timing badge style
  const getBadgeStyle = (diffDays) => {
    if (diffDays === 0) {
      return 'bg-red-500 text-white animate-pulse font-bold shadow-xs'
    }
    if (diffDays === 1) {
      return 'bg-amber-100 text-amber-950 font-bold shadow-xs'
    }
    if (diffDays === 2) {
      return 'bg-white text-orange-950 font-bold shadow-xs'
    }
    return 'bg-white/20 text-white font-semibold backdrop-blur-xs'
  }

  return (
    <div
      id="festival-reminder-banner"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false)
        isDragging.current = false
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 dark:from-amber-600 dark:via-orange-600 dark:to-amber-700 text-white shadow-md shadow-orange-500/15 p-3.5 sm:p-4 transition-all duration-300 select-none border border-amber-300/40 dark:border-amber-500/30 cursor-grab active:cursor-grabbing"
    >
      {/* Main Banner Content */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        
        {/* Left Section: Icon & Full Festival Details */}
        <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
          {/* Festival Emoji/Icon */}
          <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner text-2xl sm:text-3xl mt-0.5 sm:mt-0">
            {currentFest.icon || '🎉'}
          </div>

          {/* Festival Information */}
          <div className="min-w-0 flex-1 space-y-1.5">
            {/* Urgency Badge + Date Right Next to It */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-0.5 rounded-full text-xs sm:text-[13px] font-semibold uppercase tracking-wider ${getBadgeStyle(currentFest.diffDays)}`}>
                {currentFest.timingLabel || `In ${currentFest.diffDays} Days`}
              </span>

              {/* Date pill directly following the timing tag */}
              <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/25 backdrop-blur-md text-amber-100 text-xs sm:text-[13px] font-mono font-semibold border border-white/20 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>{dateFormatted}</span>
              </div>
            </div>

            {/* Clear & Full Festival Title in Semibold with Increased Font Size */}
            <h2 className="font-display font-semibold text-base sm:text-lg lg:text-xl text-white leading-snug tracking-normal drop-shadow-xs">
              {currentFest.name} {currentFest.hindiName ? <span className="font-medium opacity-95 text-amber-100">({currentFest.hindiName})</span> : ''}
            </h2>

            {/* Milk Demand & Preparation Advice */}
            {currentFest.milkAdvice && (
              <p className="text-xs sm:text-sm text-white/95 font-body flex items-center gap-1.5 pt-0.5">
                <span className="bg-white/20 px-2.5 py-1 rounded-lg font-semibold text-xs sm:text-[13px] backdrop-blur-xs">
                  💡 {currentFest.milkAdvice}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Right Section: Pagination Dots + Festival List Button + ❌ Dismiss Button in the SAME row */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-2.5 shrink-0 self-end sm:self-center">
          
          {/* Pagination Dots (Positioned to the left, sleek & compact size) */}
          {festivals.length > 1 && (
            <div className="flex items-center gap-1 px-2 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-black/20 backdrop-blur-xs">
              {festivals.map((fest, idx) => {
                const isActive = idx === currentIndex
                return (
                  <button
                    key={fest.id || `${fest.name}-${idx}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentIndex(idx)
                    }}
                    title={`${fest.name} (${fest.timingLabel || dateFormatted})`}
                    aria-label={`Go to festival slide ${idx + 1} of ${festivals.length}`}
                    className={`transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'w-4 h-1.5 rounded-full bg-white shadow-xs'
                        : 'w-1.5 h-1.5 rounded-full bg-white/40 hover:bg-white/80'
                    }`}
                  />
                )
              })}
            </div>
          )}

          {/* Festival List Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onOpenAdvisor()
            }}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-white text-orange-700 hover:bg-orange-50 font-semibold text-xs sm:text-sm shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>Festival List</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Dismiss (❌) Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsDismissed(true)
            }}
            title="Dismiss reminder"
            className="p-2 rounded-xl bg-black/20 hover:bg-black/35 text-white/90 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default FestivalDemandBanner
