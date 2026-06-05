import React, { useState, useCallback } from 'react'
import Header from './components/Header'
import ProductForm from './components/ProductForm'
import ProductTable from './components/ProductTable'
import SummaryCards from './components/SummaryCards'
import SearchBar from './components/SearchBar'
import ExportImport from './components/ExportImport'
import ConfirmDialog from './components/ConfirmDialog'
import ToastContainer from './components/ToastContainer'
import { useProducts } from './hooks/useProducts'
import { useTheme } from './hooks/useTheme'
import { useToast } from './hooks/useToast'

function App() {
  const { darkMode, toggleDarkMode } = useTheme()
  const { toasts, addToast, removeToast } = useToast()

  const {
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
  } = useProducts()

  const [editingProduct, setEditingProduct] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null, productId: null })

  const handleAddProduct = useCallback((formData) => {
    addProduct(formData)
    addToast(`"${formData.name}" added!`, 'success')
  }, [addProduct, addToast])

  const handleUpdateProduct = useCallback((id, formData) => {
    updateProduct(id, formData)
    setEditingProduct(null)
    addToast(`"${formData.name}" updated!`, 'success')
  }, [updateProduct, addToast])

  const handleEditProduct = useCallback((product) => {
    setEditingProduct(product)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleDeleteRequest = useCallback((productId) => {
    const product = products.find(p => p.id === productId)
    setConfirmDialog({
      open: true,
      type: 'delete',
      productId,
      title: 'Delete Product',
      message: `Are you sure you want to delete "${product?.name}"? This cannot be undone.`
    })
  }, [products])

  const handleClearAllRequest = useCallback(() => {
    if (products.length === 0) {
      addToast('No products to clear', 'info')
      return
    }
    setConfirmDialog({
      open: true,
      type: 'clearAll',
      title: 'Clear All Products',
      message: `Are you sure you want to delete all ${products.length} products? This cannot be undone.`
    })
  }, [products, addToast])

  const handleConfirm = useCallback(() => {
    if (confirmDialog.type === 'delete') {
      deleteProduct(confirmDialog.productId)
      addToast('Product deleted', 'info')
    } else if (confirmDialog.type === 'clearAll') {
      clearAll()
      addToast('All products cleared', 'info')
    }
    setConfirmDialog({ open: false })
  }, [confirmDialog, deleteProduct, clearAll, addToast])

  const handleImport = useCallback((imported) => {
    importProducts(imported)
  }, [importProducts])

  const handleSortOrderToggle = useCallback(() => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }, [setSortOrder])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Header
        summary={summary}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Summary Cards */}
        <SummaryCards summary={summary} productCount={products.length} />

        {/* Product Form */}
        <ProductForm
          editingProduct={editingProduct}
          onAdd={handleAddProduct}
          onUpdate={handleUpdateProduct}
          onCancelEdit={() => setEditingProduct(null)}
        />

        {/* Actions Bar */}
        <ExportImport
          products={products}
          summary={summary}
          onImport={handleImport}
          onClearAll={handleClearAllRequest}
          onToast={addToast}
        />

        {/* Search & Filter */}
        {products.length > 0 && (
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderToggle={handleSortOrderToggle}
            filterDiscount={filterDiscount}
            onFilterChange={setFilterDiscount}
          />
        )}

        {/* Product Table */}
        <ProductTable
          products={displayProducts}
          onEdit={handleEditProduct}
          onDelete={handleDeleteRequest}
        />

        {/* Footer */}
        <footer className="text-center py-6 text-xs text-slate-400 dark:text-slate-500 font-body">
          <p>Sudha Bill Calculator • Offline-First PWA • Data stored locally on your device</p>
        </footer>
      </main>

      {/* Dialogs & Notifications */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmDialog({ open: false })}
        confirmLabel={confirmDialog.type === 'clearAll' ? 'Clear All' : 'Delete'}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

export default App
