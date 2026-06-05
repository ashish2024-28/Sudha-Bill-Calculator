import React from 'react'
import { TrendingDown, ShoppingBag, Receipt, Banknote, Package } from 'lucide-react'
import { formatCurrency } from '../utils/calculations'

const StatCard = ({ icon: Icon, label, value, subValue, colorClass, bgClass, borderClass }) => (
  <div className={`stat-card flex items-start gap-4 group cursor-default`}>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bgClass} flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
      <Icon size={22} className={colorClass} />
    </div>
    <div className="min-w-0">
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
      <p className={`font-mono font-bold text-xl text-slate-800 dark:text-slate-100 leading-tight truncate`}>{value}</p>
      {subValue && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subValue}</p>}
    </div>
  </div>
)

const SummaryCards = ({ summary, productCount }) => {
  const discountPct = summary.subtotal > 0
    ? ((summary.totalDiscount / summary.subtotal) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={Receipt}
        label="Subtotal"
        value={formatCurrency(summary.subtotal)}
        subValue={`${productCount} product${productCount !== 1 ? 's' : ''}`}
        colorClass="text-blue-600 dark:text-blue-400"
        bgClass="bg-blue-50 dark:bg-blue-900/30"
      />
      <StatCard
        icon={TrendingDown}
        label="Total Discount"
        value={formatCurrency(summary.totalDiscount)}
        subValue={`${discountPct}% saved`}
        colorClass="text-red-500 dark:text-red-400"
        bgClass="bg-red-50 dark:bg-red-900/30"
      />
      <StatCard
        icon={Package}
        label="Total Items"
        value={summary.totalItems.toLocaleString('en-IN')}
        subValue="units"
        colorClass="text-purple-600 dark:text-purple-400"
        bgClass="bg-purple-50 dark:bg-purple-900/30"
      />
      <StatCard
        icon={Banknote}
        label="Grand Total"
        value={formatCurrency(summary.grandTotal)}
        subValue="payable amount"
        colorClass="text-emerald-600 dark:text-emerald-400"
        bgClass="bg-emerald-50 dark:bg-emerald-900/30"
      />
    </div>
  )
}

export default SummaryCards
