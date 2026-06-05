import React from 'react'
import { Edit2, Trash2, Package, ChevronRight } from 'lucide-react'
import { calculateProductTotals, formatCurrency} from '../utils/calculations'

const EmptyState = () => (
  <div className="text-center py-16 px-4">
    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
      <Package size={32} className="text-slate-400 dark:text-slate-500" />
    </div>
    <h3 className="font-display font-semibold text-lg text-slate-700 dark:text-slate-300 mb-2">No Products Yet</h3>
    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">
      Add your first product using the form above to get started.
    </p>
  </div>
)

const ProductRow = ({ product, onEdit, onDelete }) => {
  const { itemTotal, discountAmount, finalTotal } = calculateProductTotals(product)
  const hasDiscount = (parseFloat(product.discount) || 0) > 0

  return (
    <tr className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors duration-150 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
      <td className="px-4 py-3 max-w-[160px]">
        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block" title={product.name}>
          {product.name}
        </span>
        {hasDiscount && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            ₹{product.discount} off
          </span>
        )}
      </td>
      <td className="px-4 py-3 font-mono text-sm text-slate-700 dark:text-slate-300 text-right">
        {formatCurrency(product.price)}
      </td>
      <td className="px-4 py-3 text-center">
        <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-lg text-sm">
          {product.quantity}
        </span>
      </td>
      <td className="px-4 py-3 text-center hidden sm:table-cell">
        {hasDiscount ? (
          <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-semibold px-2 py-1 rounded-lg font-mono">
            ₹{product.discount}
          </span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 text-xs">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-right hidden md:table-cell">
        {hasDiscount ? (
          <span className="font-mono text-sm text-red-500 dark:text-red-400">
            -{formatCurrency(discountAmount)}
          </span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 text-xs">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
          {formatCurrency(finalTotal)}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(product)}
            className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-800/60 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-colors"
            title="Edit"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/40 hover:bg-red-100 dark:hover:bg-red-800/60 text-red-500 dark:text-red-400 flex items-center justify-center transition-colors"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  )
}

// Mobile card view
const ProductCard = ({ product, onEdit, onDelete }) => {
  const { itemTotal, discountAmount, finalTotal } = calculateProductTotals(product)
  const hasDiscount = (parseFloat(product.discount) || 0) > 0

  return (
    <div className="card p-4 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 font-display">{product.name}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{formatCurrency(product.price)} × {product.quantity}</span>
            {hasDiscount && (
              <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-semibold px-1.5 py-0.5 rounded font-mono">
                -{product.discount}%
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(product)}
            className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 text-blue-600 dark:text-blue-400 flex items-center justify-center"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/40 hover:bg-red-100 text-red-500 dark:text-red-400 flex items-center justify-center"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Item Total</p>
          <p className="font-mono font-semibold text-sm text-slate-700 dark:text-slate-300">{formatCurrency(itemTotal)}</p>
        </div>
        {hasDiscount && (
          <>
            <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
            <div className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">Discount</p>
              <p className="font-mono font-semibold text-sm text-red-500">-{formatCurrency(discountAmount)}</p>
            </div>
          </>
        )}
        <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Final</p>
          <p className="font-mono font-bold text-base text-emerald-600 dark:text-emerald-400">{formatCurrency(finalTotal)}</p>
        </div>
      </div>
    </div>
  )
}

const ProductTable = ({ products, onEdit, onDelete }) => {
  if (products.length === 0) {
    return (
      <div className="card">
        <EmptyState />
      </div>
    )
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="card overflow-hidden hidden md:block">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-semibold font-display text-slate-500 dark:text-slate-400 uppercase tracking-wide">Product</th>
                <th className="px-4 py-3 text-right text-xs font-semibold font-display text-slate-500 dark:text-slate-400 uppercase tracking-wide">Price</th>
                <th className="px-4 py-3 text-center text-xs font-semibold font-display text-slate-500 dark:text-slate-400 uppercase tracking-wide">Qty</th>
                <th className="px-4 py-3 text-center text-xs font-semibold font-display text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden sm:table-cell">Disc%</th>
                <th className="px-4 py-3 text-right text-xs font-semibold font-display text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden md:table-cell">Disc Amt</th>
                <th className="px-4 py-3 text-right text-xs font-semibold font-display text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total</th>
                <th className="px-4 py-3 text-xs font-semibold font-display text-slate-500 dark:text-slate-400 uppercase tracking-wide w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Showing {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </>
  )
}

export default ProductTable
