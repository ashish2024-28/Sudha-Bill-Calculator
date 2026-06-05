import { useState, useEffect, useCallback, useMemo } from 'react'
import { storageService } from '../services/storageService'
import { generateId, calculateSummary, sortProducts } from '../utils/calculations'

const STORAGE_KEYS = {
  patandairy: 'sudha_bill_patandairy_products',
  arradairy: 'sudha_bill_arradairy_products',
}

export const useProducts = (tab = 'patandairy') => {
  const storageKey = STORAGE_KEYS[tab] || STORAGE_KEYS.patandairy

  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [filterDiscount, setFilterDiscount] = useState('all')

  // Reload when tab changes
  useEffect(() => {
    const saved = storageService.getProducts(storageKey)
    setProducts(saved)
  }, [storageKey])

  const saveProducts = useCallback((updatedProducts) => {
    setProducts(updatedProducts)
    storageService.saveProducts(updatedProducts, storageKey)
  }, [storageKey])

  const addProduct = useCallback((productData) => {
    const newProduct = {
      id: generateId(),
      name: productData.name.trim(),
      price: parseFloat(productData.price),
      quantity: parseInt(productData.quantity),
      discount: parseFloat(productData.discount) || 0,
      createdAt: new Date().toISOString()
    }
    setProducts(prev => {
      const updated = [...prev, newProduct]
      storageService.saveProducts(updated, storageKey)
      return updated
    })
    return newProduct
  }, [storageKey])

  const updateProduct = useCallback((id, productData) => {
    setProducts(prev => {
      const updated = prev.map(p =>
        p.id === id
          ? {
              ...p,
              name: productData.name.trim(),
              price: parseFloat(productData.price),
              quantity: parseInt(productData.quantity),
              discount: parseFloat(productData.discount) || 0,
              updatedAt: new Date().toISOString()
            }
          : p
      )
      storageService.saveProducts(updated, storageKey)
      return updated
    })
  }, [storageKey])

  const deleteProduct = useCallback((id) => {
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== id)
      storageService.saveProducts(updated, storageKey)
      return updated
    })
  }, [storageKey])

  const clearAll = useCallback(() => {
    setProducts([])
    storageService.clearProducts(storageKey)
  }, [storageKey])

  const importProducts = useCallback((imported) => {
    const normalized = imported.map(p => ({
      id: p.id || generateId(),
      name: p.name || 'Unnamed Product',
      price: parseFloat(p.price) || 0,
      quantity: parseInt(p.quantity) || 1,
      discount: parseFloat(p.discount) || 0,
      createdAt: p.createdAt || new Date().toISOString()
    }))
    setProducts(normalized)
    storageService.saveProducts(normalized, storageKey)
  }, [storageKey])

  const displayProducts = useMemo(() => {
    let filtered = products

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q))
    }

    if (filterDiscount === 'has-discount') {
      filtered = filtered.filter(p => (parseFloat(p.discount) || 0) > 0)
    } else if (filterDiscount === 'no-discount') {
      filtered = filtered.filter(p => (parseFloat(p.discount) || 0) === 0)
    }

    return sortProducts(filtered, sortBy, sortOrder)
  }, [products, searchQuery, sortBy, sortOrder, filterDiscount])

  const summary = useMemo(() => calculateSummary(products), [products])

  return {
    products,
    displayProducts,
    summary,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filterDiscount,
    setFilterDiscount,
    addProduct,
    updateProduct,
    deleteProduct,
    clearAll,
    importProducts
  }
}