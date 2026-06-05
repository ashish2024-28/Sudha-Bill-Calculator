import React, { useState, useEffect } from 'react'
import { Plus, X, Edit3, Tag, DollarSign, Hash, Percent } from 'lucide-react'
import { validateProduct, calculateProductTotals, formatCurrency } from '../utils/calculations'

const EMPTY_FORM = { name: '', price: '', quantity: '1', discount: '0' }

const ProductForm = ({ editingProduct, onAdd, onUpdate, onCancelEdit }) => {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        price: String(editingProduct.price),
        quantity: String(editingProduct.quantity),
        discount: String(editingProduct.discount)
      })
      setErrors({})
      setTouched({})
    }
  }, [editingProduct])

  const preview = form.price && form.quantity
    ? calculateProductTotals({
      price: form.price,
      quantity: form.quantity,
      discount: form.discount
    })
    : null

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setTouched(prev => ({ ...prev, [field]: true }))

    const updated = { ...form, [field]: value }
    const { errors: newErrors } = validateProduct(updated)
    setErrors(prev => ({ ...prev, [field]: newErrors[field] }))
  }

  const handleSubmit = () => {
    const allTouched = { name: true, price: true, quantity: true, discount: true }
    setTouched(allTouched)

    const { isValid, errors: validationErrors } = validateProduct(form)
    if (!isValid) {
      setErrors(validationErrors)
      return
    }

    if (editingProduct) {
      onUpdate(editingProduct.id, form)
    } else {
      onAdd(form)
    }

    setForm(EMPTY_FORM)
    setErrors({})
    setTouched({})
  }

  const handleClear = () => {
    if (editingProduct) {
      onCancelEdit()
    }
    setForm(EMPTY_FORM)
    setErrors({})
    setTouched({})
  }

  const isEditing = !!editingProduct

  return (
    <div className={`card p-6 animate-slide-up transition-all duration-300 ${isEditing ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900' : ''}`}>
      {/* Form Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isEditing ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-blue-100 dark:bg-blue-900/40'}`}>
            {isEditing
              ? <Edit3 size={16} className="text-amber-600 dark:text-amber-400" />
              : <Plus size={16} className="text-blue-600 dark:text-blue-400" />
            }
          </div>
          <h2 className="font-display font-semibold text-lg text-slate-800 dark:text-slate-100">
            {isEditing ? 'Edit Product' : 'Add Product'}
          </h2>
        </div>
        {isEditing && (
          <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-lg font-semibold">
            Editing
          </span>
        )}
      </div>

      {/* Fields Grid */}
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3 sm:gap-4 mb-4">        {/* Product Name */}
        <div className="sm:col-span-2">
          <label className="label">
            <Tag size={12} className="inline mr-1" />
            Product Name
          </label>
          <input
            type="text"
            className={`input-field ${errors.name && touched.name ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="e.g. Basmati Rice 5kg"
            value={form.name}
            onChange={e => handleChange('name', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          {errors.name && touched.name && (
            <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="label">
            <DollarSign size={12} className="inline mr-1" />
            Price (₹)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            className={`input-field font-mono ${errors.price && touched.price ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="0.00"
            value={form.price}
            onChange={e => handleChange('price', e.target.value)}
          />
          {errors.price && touched.price && (
            <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.price}</p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label className="label">
            <Hash size={12} className="inline mr-1" />
            Quantity
          </label>
          <input
            type="number"
            min="1"
            step="1"
            className={`input-field font-mono ${errors.quantity && touched.quantity ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="1"
            value={form.quantity}
            onChange={e => handleChange('quantity', e.target.value)}
          />
          {errors.quantity && touched.quantity && (
            <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.quantity}</p>
          )}
        </div>

        {/* Discount */}
        <div>
          <label className="label">
            <Percent size={12} className="inline mr-1" />
            Discount %
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            className={`input-field font-mono ${errors.discount && touched.discount ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="0"
            value={form.discount}
            onChange={e => handleChange('discount', e.target.value)}
          />
          {errors.discount && touched.discount && (
            <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.discount}</p>
          )}
        </div>

        {/* Live Preview */}
        {preview && (
          <div className="min-[400px]:col-span-2 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-3">            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 font-display uppercase tracking-wide">Preview</p>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">Item Total</p>
                <p className="font-mono font-semibold text-sm text-slate-700 dark:text-slate-300">{formatCurrency(preview.itemTotal)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">Discount</p>
                <p className="font-mono font-semibold text-sm text-red-500">-{formatCurrency(preview.discountAmount)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">Final</p>
                <p className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">{formatCurrency(preview.finalTotal)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button onClick={handleSubmit} className={`flex-1 flex items-center justify-center gap-2 ${isEditing ? 'btn-success' : 'btn-primary'}`}>
          {isEditing
            ? <><Edit3 size={16} /> Update Product</>
            : <><Plus size={16} /> Add Product</>
          }
        </button>
        <button onClick={handleClear} className="btn-secondary flex items-center gap-2">
          <X size={16} />
          {isEditing ? 'Cancel' : 'Clear'}
        </button>
      </div>
    </div>
  )
}

export default ProductForm
