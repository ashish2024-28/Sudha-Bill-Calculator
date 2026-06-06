import React, { useState, useCallback } from 'react'
import Header from './components/Header'
// import ProductForm from './components/ProductForm'
// import ProductTable from './components/ProductTable'
// import SummaryCards from './components/SummaryCards'
// import SearchBar from './components/SearchBar'
// import ExportImport from './components/ExportImport'
// import ConfirmDialog from './components/ConfirmDialog'
// import ToastContainer from './components/ToastContainer'
import InstallPrompt from './components/InstallPrompt'
import { useProducts } from './hooks/useProducts'
import { useTheme } from './hooks/useTheme'
import { useToast } from './hooks/useToast'
import DairyOrderTable from './components/DairyOrderTable'

function App() {
  const { darkMode, toggleDarkMode } = useTheme()
  const { toasts, addToast, removeToast } = useToast()
  const [activeTab, setActiveTab] = useState('patandairy')

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
    importProducts,
  } = useProducts(activeTab)

  const [editingProduct, setEditingProduct] = useState(null)
  const [confirmDialog, setConfirmDialog]   = useState({ open: false, type: null, productId: null })

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setEditingProduct(null)
  }

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
      message: `Are you sure you want to delete "${product?.name}"? This cannot be undone.`,
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
      message: `Are you sure you want to delete all ${products.length} products? This cannot be undone.`,
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

        {/* ── Tab switcher ── */}
        {/* NOTE: modifyMode and editMode are now managed INSIDE DairyOrderTable,
            so no Modify button needed here. Just the tab switcher. */}
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
          {[
            { key: 'patandairy', label: '🐄 Patna Dairy' },
            { key: 'arradairy',  label: '🥛 Arra Dairy'  },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold font-display transition-all duration-200
                ${activeTab === tab.key
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
             <span className='text-xl'>{tab.label}</span> 
            </button>
          ))}
        </div>

        {/* ── Dairy Order Table
              Key prop forces a fresh mount when switching tabs so each tab
              gets its own independent modifyMode / editMode / showExtraTable state.
              Tab data itself is stored inside DairyOrderTable keyed by tabKey. ── */}
        <DairyOrderTable
          key={activeTab}
          tabName={activeTab === 'patandairy' ? '🐄 Patan Dairy' : '🥛 Arra Dairy'}
          tabKey={activeTab}
        />

        {/* Summary Cards */}
        {/* <SummaryCards summary={summary} productCount={products.length} /> */}

        {/* Product Form */}
        {/* <ProductForm
          editingProduct={editingProduct}
          onAdd={handleAddProduct}
          onUpdate={handleUpdateProduct}
          onCancelEdit={() => setEditingProduct(null)}
        /> */}

        {/* Actions Bar */}
        {/* <ExportImport
          products={products}
          summary={summary}
          onImport={handleImport}
          onClearAll={handleClearAllRequest}
          onToast={addToast}
        /> */}

        {/* Search & Filter */}
        {/* {products.length > 0 && (
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
        )} */}

        {/* Product Table */}
        {/* <ProductTable
          products={displayProducts}
          onEdit={handleEditProduct}
          onDelete={handleDeleteRequest}
        /> */}

        {/* Footer */}
        <footer className="text-center py-6 text-xs text-slate-400 dark:text-slate-500 font-body">
          <p>Sudha Bill Calculator • Offline-First PWA • Data stored locally on your device</p>
        </footer>
      </main>
{/* 
      <ConfirmDialog
        isOpen={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmDialog({ open: false })}
        confirmLabel={confirmDialog.type === 'clearAll' ? 'Clear All' : 'Delete'}
      /> */}

      {/* <ToastContainer toasts={toasts} onRemove={removeToast} /> */}
      <InstallPrompt />
    </div>
  )
}

export default App