import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'

function Products() {
  const { products, updateProductPrice, addProduct } = useApp()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [form, setForm] = useState({
    code: '', name: '', size: '', category: '',
    bulkPrice: '', retailPrice: '', labourRate: ''
  })

  // Group products by category
  const grouped = products.reduce((acc, p) => {
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

  function handleAddProduct() {
    if (!form.code || !form.name || !form.category) return
    addProduct({
      code: form.code,
      name: form.name,
      size: form.size,
      category: form.category,
      bulkPrice: parseFloat(form.bulkPrice) || 0,
      retailPrice: parseFloat(form.retailPrice) || 0,
      labourRate: parseFloat(form.labourRate) || 0,
    })
    setForm({ code: '', name: '', size: '', category: '', bulkPrice: '', retailPrice: '', labourRate: '' })
    setShowAddModal(false)
  }

  const existingCategories = [...new Set(products.map(p => p.category))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Products</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage product prices and labour rates · Click any price to edit
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
        >
          + Add Product
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Categories</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{existingCategories.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Avg Bulk Price</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            ₹{Math.round(products.reduce((s, p) => s + p.bulkPrice, 0) / products.length).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Category wise tables */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="bg-white rounded-xl shadow overflow-hidden">
            {/* Category header */}
            <div className="flex items-center justify-between px-6 py-4 bg-indigo-50 border-b border-indigo-100">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-indigo-800">{category}</span>
                <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
                  {items.length} products
                </span>
              </div>
              <div className="flex gap-6 text-xs text-indigo-600 font-medium">
                <span>Bulk avg: ₹{Math.round(items.reduce((s, p) => s + p.bulkPrice, 0) / items.length)}</span>
                <span>Retail avg: ₹{Math.round(items.reduce((s, p) => s + p.retailPrice, 0) / items.length)}</span>
              </div>
            </div>

            {/* Products table */}
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs text-gray-400 uppercase">
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Size</th>
                  <th className="px-6 py-3">Bulk Price (₹)</th>
                  <th className="px-6 py-3">Retail Price (₹)</th>
                  <th className="px-6 py-3">Labour Rate (₹/pc)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map(product => (
                  <tr key={product.code} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-mono text-sm text-gray-500">
                      {product.code}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-800">
                      {product.name}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {product.size}
                    </td>

                    {/* Bulk Price — editable */}
                    <td className="px-6 py-3">
                      {editingCell === `${product.code}-bulkPrice` ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            className="w-24 border border-indigo-400 rounded px-2 py-1 text-sm focus:outline-none"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => handleEditSave(product.code, 'bulkPrice')}
                            onKeyDown={e => e.key === 'Enter' && handleEditSave(product.code, 'bulkPrice')}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <span
                          onClick={() => handleEditStart(product.code, 'bulkPrice', product.bulkPrice)}
                          className="text-sm font-medium text-green-600 cursor-pointer hover:bg-green-50 px-2 py-1 rounded border border-transparent hover:border-green-300 transition"
                        >
                          ₹{product.bulkPrice}
                        </span>
                      )}
                    </td>

                    {/* Retail Price — editable */}
                    <td className="px-6 py-3">
                      {editingCell === `${product.code}-retailPrice` ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            className="w-24 border border-indigo-400 rounded px-2 py-1 text-sm focus:outline-none"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => handleEditSave(product.code, 'retailPrice')}
                            onKeyDown={e => e.key === 'Enter' && handleEditSave(product.code, 'retailPrice')}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <span
                          onClick={() => handleEditStart(product.code, 'retailPrice', product.retailPrice)}
                          className="text-sm font-medium text-blue-600 cursor-pointer hover:bg-blue-50 px-2 py-1 rounded border border-transparent hover:border-blue-300 transition"
                        >
                          ₹{product.retailPrice}
                        </span>
                      )}
                    </td>

                    {/* Labour Rate — editable */}
                    <td className="px-6 py-3">
                      {editingCell === `${product.code}-labourRate` ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            className="w-24 border border-indigo-400 rounded px-2 py-1 text-sm focus:outline-none"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => handleEditSave(product.code, 'labourRate')}
                            onKeyDown={e => e.key === 'Enter' && handleEditSave(product.code, 'labourRate')}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <span
                          onClick={() => handleEditStart(product.code, 'labourRate', product.labourRate)}
                          className="text-sm font-medium text-orange-600 cursor-pointer hover:bg-orange-50 px-2 py-1 rounded border border-transparent hover:border-orange-300 transition"
                        >
                          ₹{product.labourRate}/pc
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <Modal title="Add New Product" onClose={() => setShowAddModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Product Code</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value })}
                  placeholder="e.g. Sd 300"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Size</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.size}
                  onChange={e => setForm({ ...form, size: e.target.value })}
                  placeholder="e.g. 300 or Small"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.category}
                onChange={e => {
                  const cat = e.target.value
                  const existing = products.find(p => p.category === cat)
                  setForm({
                    ...form,
                    category: cat,
                    name: existing ? existing.name : form.name
                  })
                }}
              >
                <option value="">Select or type new</option>
                {existingCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-2"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                placeholder="Or type new category"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Product Name</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Kalash Standard"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Bulk Price (₹)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.bulkPrice}
                  onChange={e => setForm({ ...form, bulkPrice: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Retail Price (₹)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.retailPrice}
                  onChange={e => setForm({ ...form, retailPrice: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Labour Rate (₹/pc)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.labourRate}
                  onChange={e => setForm({ ...form, labourRate: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Preview */}
            {form.code && form.bulkPrice && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 space-y-1">
                <p className="text-sm font-medium text-indigo-800">{form.code} — {form.name} {form.size}</p>
                <div className="flex gap-4 text-xs text-indigo-600">
                  <span>Bulk: ₹{form.bulkPrice}</span>
                  <span>Retail: ₹{form.retailPrice}</span>
                  <span>Labour: ₹{form.labourRate}/pc</span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddProduct}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                Add Product
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Products