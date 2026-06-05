import React from 'react'
import { Search, ArrowUpDown, Filter, X } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'price', label: 'Price' },
  { value: 'quantity', label: 'Qty' },
  { value: 'discount', label: 'Discount' },
  { value: 'total', label: 'Total' },
]

const SearchBar = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderToggle,
  filterDiscount,
  onFilterChange
}) => {
  return (
    <div className="card p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="input-field pl-9 pr-9"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">          <div className="relative">
          <select
            className="input-field pr-8 appearance-none cursor-pointer text-sm"
            value={sortBy}
            onChange={e => onSortChange(e.target.value)}
            style={{ minWidth: '100px', maxWidth: '140px' }}            >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

          <button
            onClick={onSortOrderToggle}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center"
            title={sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
          >
            <ArrowUpDown
              size={16}
              className={`text-slate-600 dark:text-slate-400 transition-transform duration-200 ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Filter */}
          <div className="relative">
            <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              className="input-field pl-7 appearance-none cursor-pointer text-sm"
              value={filterDiscount}
              onChange={e => onFilterChange(e.target.value)}
              style={{ minWidth: '110px', maxWidth: '150px' }}            >
              <option value="all">All Products</option>
              <option value="has-discount">Has Discount</option>
              <option value="no-discount">No Discount</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchBar
