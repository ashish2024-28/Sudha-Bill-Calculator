import React, { useState, useEffect } from 'react'
import { Info, X, Sparkles, Clock, CheckCircle, ShieldCheck, Code2 } from 'lucide-react'
import { APP_VERSIONS, APP_INFO } from '../versions'

const AboutVersionDrawer = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('versions') // 'versions' | 'about'

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-800 w-full max-w-md h-full shadow-2xl border-l border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-slideLeft"
      >
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-800 dark:text-slate-100">
                App Info & Versions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sudha Bill Calculator {APP_VERSIONS[0]?.version}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-2xl bg-slate-100 hover:bg-red-500 hover:text-white dark:bg-slate-700 dark:hover:bg-red-600 dark:hover:text-white text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shadow-xs transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
            title="Close drawer"
            aria-label="Close drawer"
          >
            <X className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('versions')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'versions'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Version History
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'about'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> About Web App
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
          {activeTab === 'versions' ? (
            <div className="space-y-4">
              {APP_VERSIONS.map((v, idx) => (
                <div
                  key={v.version}
                  className="p-4 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60 relative"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-base text-slate-800 dark:text-slate-100">
                        {v.version}
                      </span>
                      {v.tag && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          v.tag === 'Latest'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                        }`}>
                          {v.tag}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{v.date}</span>
                  </div>

                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    {v.title}
                  </p>

                  <ul className="space-y-1.5">
                    {v.changes.map((change, cIdx) => (
                      <li key={cIdx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {/* App Description Card */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/30 dark:to-slate-800 rounded-2xl border border-blue-100 dark:border-blue-900/40">
                <h4 className="font-display font-bold text-base text-blue-900 dark:text-blue-200 mb-1">
                  {APP_INFO.name}
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-3">
                  {APP_INFO.subtitle}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {APP_INFO.description}
                </p>
              </div>

              {/* Core Features */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Key Features
                </h5>
                <div className="space-y-2">
                  {APP_INFO.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                      {feat}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Stack */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-purple-500" /> Technology Stack
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {APP_INFO.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 text-center text-xs text-slate-400">
          <p>© 2026 {APP_INFO.name} • All rights reserved</p>
        </div>

      </div>
    </div>
  )
}

export default AboutVersionDrawer
