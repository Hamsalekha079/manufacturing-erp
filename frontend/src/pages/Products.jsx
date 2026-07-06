import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'

function Products() {
  const { products, updateProductPrice, addProduct, deleteProduct, categories, addCategory, deleteCategory } = useApp()
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [search, setSearch] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [openCategory, setOpenCategory] = useState(null)
  const [productForm, setProductForm] = useState({
    code: '', size: '', bulkPrice: '', retailPrice: '',
    shapingRate: '', finishingRate: '', polishingRate: ''
  })

  const filteredProducts = products.filter(p => {
    const q = search.toLowerCase()
    return (
      p.code.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      String(p.size).toLowerCase().includes(q)
    )
  })

  const grouped = filteredProducts.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {})

  function handleEditStart(code, field, value) {
    setEditingCell(`${code}-${field}`)
    setEditValue(value)
  }

  function handleEditSave(code, field) {
    updateProductPrice(code, field, editValue)
    setEditingCell(null)
    setEditValue('')
  }

  function handleAddProductToCategory(categoryName) {
    if (!productForm.code || !productForm.size) return
    addProduct({
      code: productForm.code,
      name: categoryName,
      size: productForm.size,
      category: categoryName,
      bulkPrice: parseFloat(productForm.bulkPrice) || 0,
      retailPrice: parseFloat(productForm.retailPrice) || 0,
      shapingRate: parseFloat(productForm.shapingRate) || 0,
      finishingRate: parseFloat(productForm.finishingRate) || 0,
      polishingRate: parseFloat(productForm.polishingRate) || 0,
    })
    setProductForm({ code: '', size: '', bulkPrice: '', retailPrice: '', shapingRate: '', finishingRate: '', polishingRate: '' })
  }

  function totalLabour(p) {
    return (p.shapingRate || 0) + (p.finishingRate || 0) + (p.polishingRate || 0)
  }

  async function handleDeleteCategory(cat, catProducts) {
    if (catProducts.length > 0) {
      if (!window.confirm(`"${cat.name}" has ${catProducts.length} product(s). Deleting this category will also delete all its products. Continue?`)) return
      for (const p of catProducts) {
        await deleteProduct(p.code)
      }
    } else {
      if (!window.confirm(`Delete category "${cat.name}"?`)) return
    }
    deleteCategory(cat.id)
  }

  function EditableCell({ product, field, colorClass, suffix = '' }) {
    return editingCell === `${product.code}-${field}` ? (
      <input
        type="number"
        className="w-20 border border-indigo-400 rounded px-2 py-1 text-sm focus:outline-none"
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        onBlur={() => handleEditSave(product.code, field)}
        onKeyDown={e => e.key === 'Enter' && handleEditSave(product.code, field)}
        autoFocus
      />
    ) : (
      <span
        onClick={() => handleEditStart(product.code, field, product[field] || 0)}
        className={`text-sm font-medium ${colorClass} cursor-pointer hover:bg-gray-50 px-2 py-1 rounded border border-transparent hover:border-gray-300 transition whitespace-nowrap`}
      >
        ₹{product[field] || 0}{suffix}
      </span>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Products</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage categories, prices and stage-wise labour rates · Click any value to edit
          </p>
        </div>
        <button
          onClick={() => setShowCategoryModal(true)}
          className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 whitespace-nowrap"
        >
          + Manage Categories & Products
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-md">
        <input
          type="text"
          placeholder="Search by code, name, category or size..."
          className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white flex flex-col justify-between rounded-xl shadow p-4 sm:p-5">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{products.length}</p>
        </div>
        <div className="bg-white flex flex-col justify-between rounded-xl shadow p-4 sm:p-5">
          <p className="text-sm text-gray-500">Categories</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{categories.length}</p>
        </div>
        <div className="bg-white flex flex-col justify-between rounded-xl shadow p-4 sm:p-5">
          <p className="text-sm text-gray-500">Avg Bulk Price</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {products.length > 0
              ? `₹${Math.round(products.reduce((s, p) => s + p.bulkPrice, 0) / products.length).toLocaleString()}`
              : '₹0'}
          </p>
        </div>
      </div>

      {/* Category wise tables */}
      <div className="space-y-4 sm:space-y-6">
        {Object.keys(grouped).length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <p className="text-sm text-gray-400">No products yet.</p>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="text-indigo-600 text-sm hover:underline mt-2"
            >
              + Create your first category & product
            </button>
          </div>
        )}
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="bg-white rounded-xl shadow overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-indigo-50 border-b border-indigo-100">
              <div className="flex items-center gap-3">
                <span className="text-base sm:text-lg font-bold text-indigo-800">{category}</span>
                <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full whitespace-nowrap">
                  {items.length} products
                </span>
              </div>
              <div className="flex gap-4 sm:gap-6 text-xs text-indigo-600 font-medium">
                <span className="whitespace-nowrap">Bulk avg: ₹{Math.round(items.reduce((s, p) => s + p.bulkPrice, 0) / items.length)}</span>
                <span className="whitespace-nowrap">Retail avg: ₹{Math.round(items.reduce((s, p) => s + p.retailPrice, 0) / items.length)}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs text-gray-400 uppercase">
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Bulk (₹)</th>
                    <th className="px-4 py-3">Retail (₹)</th>
                    <th className="px-4 py-3">Shaping (₹/pc)</th>
                    <th className="px-4 py-3">Finishing (₹/pc)</th>
                    <th className="px-4 py-3">Polishing (₹/pc)</th>
                    <th className="px-4 py-3">Total Labour</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map(product => (
                    <tr key={product.code} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm text-gray-500 whitespace-nowrap">{product.code}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{product.size}</td>
                      <td className="px-4 py-3">
                        <EditableCell product={product} field="bulkPrice" colorClass="text-green-600" />
                      </td>
                      <td className="px-4 py-3">
                        <EditableCell product={product} field="retailPrice" colorClass="text-blue-600" />
                      </td>
                      <td className="px-4 py-3">
                        <EditableCell product={product} field="shapingRate" colorClass="text-orange-600" suffix="/pc" />
                      </td>
                      <td className="px-4 py-3">
                        <EditableCell product={product} field="finishingRate" colorClass="text-purple-600" suffix="/pc" />
                      </td>
                      <td className="px-4 py-3">
                        <EditableCell product={product} field="polishingRate" colorClass="text-pink-600" suffix="/pc" />
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-indigo-700 whitespace-nowrap">
                        ₹{totalLabour(product)}/pc
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete product ${product.code}?`)) deleteProduct(product.code)
                          }}
                          className="text-red-400 hover:text-red-600 text-sm"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Manage Categories & Products Modal */}
      {showCategoryModal && (
        <Modal title="Manage Categories & Products" onClose={() => setShowCategoryModal(false)}>
          <div className="space-y-4 max-h-[70vh] sm:max-h-[25rem] overflow-y-auto pr-1">

            {/* Create new category */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                placeholder="New category e.g. Kalash - Standard"
                onKeyDown={e => {
                  if (e.key === 'Enter' && newCategoryName.trim()) {
                    addCategory(newCategoryName.trim())
                    setNewCategoryName('')
                  }
                }}
              />
              <button
                onClick={() => {
                  if (!newCategoryName.trim()) return
                  if (categories.some(c => c.name === newCategoryName.trim())) return
                  addCategory(newCategoryName.trim())
                  setNewCategoryName('')
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 whitespace-nowrap"
              >
                + Add Category
              </button>
            </div>

            {/* Categories list with expandable product entry */}
            {categories.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No categories yet — create one above</p>
            ) : (
              <div className="space-y-2">
                {categories.map(cat => {
                  const catProducts = products.filter(p => p.category === cat.name)
                  const isOpen = openCategory === cat.id
                  return (
                    <div key={cat.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div
                        className="flex items-center justify-between gap-2 px-3 sm:px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                        onClick={() => setOpenCategory(isOpen ? null : cat.id)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-semibold text-gray-800 truncate">{cat.name}</span>
                          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                            {catProducts.length} codes
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={e => { e.stopPropagation(); handleDeleteCategory(cat, catProducts) }}
                            className="text-red-400 hover:text-red-600 text-xs whitespace-nowrap"
                          >
                            ✕ Remove
                          </button>
                          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>

                      {isOpen && (
                        <div className="p-3 sm:p-4 space-y-3 bg-white">
                          {/* Existing product codes in this category */}
                          {catProducts.length > 0 && (
                            <div className="space-y-1">
                              {catProducts.map(p => (
                                <div key={p.code} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 bg-gray-50 rounded-lg px-3 py-2 text-xs">
                                  <span className="font-mono text-gray-600">{p.code} — Size {p.size}</span>
                                  <div className="flex items-center justify-between sm:justify-end gap-2">
                                    <span className="text-gray-500">
                                      Bulk ₹{p.bulkPrice} · Retail ₹{p.retailPrice} · Labour ₹{totalLabour(p)}/pc
                                    </span>
                                    <button
                                      onClick={() => {
                                        if (window.confirm(`Delete product ${p.code}?`)) deleteProduct(p.code)
                                      }}
                                      className="text-red-400 hover:text-red-600 shrink-0"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add new product code form */}
                          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 space-y-2">
                            <p className="text-xs font-medium text-indigo-700">+ Add product code to {cat.name}</p>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={productForm.code}
                                onChange={e => setProductForm({ ...productForm, code: e.target.value })}
                                placeholder="Code e.g. Sd 300"
                              />
                              <input
                                className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={productForm.size}
                                onChange={e => setProductForm({ ...productForm, size: e.target.value })}
                                placeholder="Size e.g. 300 or Small"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="number"
                                className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={productForm.bulkPrice}
                                onChange={e => setProductForm({ ...productForm, bulkPrice: e.target.value })}
                                placeholder="Bulk price ₹"
                              />
                              <input
                                type="number"
                                className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={productForm.retailPrice}
                                onChange={e => setProductForm({ ...productForm, retailPrice: e.target.value })}
                                placeholder="Retail price ₹"
                              />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              <input
                                type="number"
                                className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={productForm.shapingRate}
                                onChange={e => setProductForm({ ...productForm, shapingRate: e.target.value })}
                                placeholder="Shaping ₹"
                              />
                              <input
                                type="number"
                                className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={productForm.finishingRate}
                                onChange={e => setProductForm({ ...productForm, finishingRate: e.target.value })}
                                placeholder="Finishing ₹"
                              />
                              <input
                                type="number"
                                className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 col-span-2 sm:col-span-1"
                                value={productForm.polishingRate}
                                onChange={e => setProductForm({ ...productForm, polishingRate: e.target.value })}
                                placeholder="Polishing ₹"
                              />
                            </div>
                            <button
                              onClick={() => handleAddProductToCategory(cat.name)}
                              className="w-full bg-indigo-600 text-white py-1.5 rounded-lg text-sm hover:bg-indigo-700"
                            >
                              + Add Code
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Products