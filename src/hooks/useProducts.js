import { useState, useEffect, useCallback, useMemo } from 'react'
import { storageService } from '../services/storageService'
import { generateId, calculateSummary, sortProducts } from '../utils/calculations'

export const useProducts = () => {
  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [filterDiscount, setFilterDiscount] = useState('all') // 'all' | 'has-discount' | 'no-discount'

  // Load from localStorage on mount
  useEffect(() => {
    const saved = storageService.getProducts()
    setProducts(saved)
  }, [])

  // Auto-save whenever products change
  const saveProducts = useCallback((updatedProducts) => {
    setProducts(updatedProducts)
    storageService.saveProducts(updatedProducts)
  }, [])

  const addProduct = useCallback((productData) => {
    const newProduct = {
      id: generateId(),
      name: productData.name.trim(),
      price: parseFloat(productData.price),
      quantity: parseInt(productData.quantity),
      discount: parseFloat(productData.discount) || 0,
      createdAt: new Date().toISOString()
    }
    saveProducts([...products, newProduct])
    return newProduct
  }, [products, saveProducts])

  const updateProduct = useCallback((id, productData) => {
    const updated = products.map(p =>
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
    saveProducts(updated)
  }, [products, saveProducts])

  const deleteProduct = useCallback((id) => {
    saveProducts(products.filter(p => p.id !== id))
  }, [products, saveProducts])

  const clearAll = useCallback(() => {
    saveProducts([])
    storageService.clearProducts()
  }, [saveProducts])

  const importProducts = useCallback((imported) => {
    const normalized = imported.map(p => ({
      id: p.id || generateId(),
      name: p.name || 'Unnamed Product',
      price: parseFloat(p.price) || 0,
      quantity: parseInt(p.quantity) || 1,
      discount: parseFloat(p.discount) || 0,
      createdAt: p.createdAt || new Date().toISOString()
    }))
    saveProducts(normalized)
  }, [saveProducts])

  // Derived: filtered + sorted products
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
