import { useState } from 'react'
import Modal from '../components/Modal'
import { useApp } from '../context/AppContext'

function StockGroup({ group, code, unit, low, items, showMarkFinished, onMarkFinished }) {
  const [open, setOpen] = useState(false)
  const total = items.reduce((sum, i) => sum + i.stock, 0)
  const hasLow = items.some(i => i.stock <= low)

  return (
    <div className={`bg-white rounded-xl shadow border ${hasLow ? 'border-red-200' : 'border-gray-100'}`}>
      <div
        className="flex items-center justify-between p-5 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">{code}</span>
          <span className="font-semibold text-gray-800">{group}</span>
          {hasLow && <span className="text-xs text-red-500 font-medium">⚠ Low stock</span>}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-indigo-600 font-bold">{total} {unit}</span>
          <span className="text-gray-400">{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-100 px-5 pb-5">
          <table className="w-full mt-4">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase">
                <th className="pb-2">Code</th>
                <th className="pb-2">Size</th>
                <th className="pb-2">Stock</th>
                <th className="pb-2">Status</th>
                {showMarkFinished && <th className="pb-2">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(item => (
                <tr key={item.code}>
                  <td className="py-2 text-sm font-mono text-gray-600">{item.code}</td>
                  <td className="py-2 text-sm text-gray-700">{item.size}</td>
                  <td className="py-2 text-sm font-bold text-gray-800">{item.stock} {unit}</td>
                  <td className="py-2">
                    {item.stock === 0 ? (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">Empty</span>
                    ) : item.stock <= low ? (
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">Low</span>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">OK</span>
                    )}
                  </td>
                  {showMarkFinished && (
                    <td className="py-2">
                      {item.stock > 0 && (
                        <button
                          onClick={() => onMarkFinished(item.code, item.stock, item.size)}
                          className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-200 transition"
                        >
                          Mark Finished →
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Stock() {
  const { stock, semiFinished, finished, adjustStock, markAsFinished, products } = useApp()
  const [activeTab, setActiveTab] = useState('finished')
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [showFinishModal, setShowFinishModal] = useState(false)
  const [finishForm, setFinishForm] = useState({ itemCode: '', size: '', maxQty: 0, qty: '' })
  const [form, setForm] = useState({
    stockType: 'finished', groupCode: '', itemCode: '', type: 'add', qty: '', reason: ''
  })

  const currentStock = activeTab === 'finished' ? finished : semiFinished
  const selectedGroup = currentStock.find(g => g.code === form.groupCode)

  function handleMarkFinished(itemCode, maxQty, size) {
    setFinishForm({ itemCode, size, maxQty, qty: '' })
    setShowFinishModal(true)
  }

  function handleConfirmFinish() {
    if (!finishForm.qty || parseInt(finishForm.qty) <= 0) return
    markAsFinished(finishForm.itemCode, parseInt(finishForm.qty))
    setFinishForm({ itemCode: '', size: '', maxQty: 0, qty: '' })
    setShowFinishModal(false)
  }

  function handleAdjustStock() {
    if (!form.groupCode || !form.itemCode || !form.qty) return
    adjustStock(form.stockType, form.groupCode, form.itemCode, form.type, parseInt(form.qty))
    setForm({ stockType: 'finished', groupCode: '', itemCode: '', type: 'add', qty: '', reason: '' })
    setShowAdjustModal(false)
  }

  const totalFinished = finished.reduce((s, g) => s + g.items.reduce((si, i) => si + i.stock, 0), 0)
  const totalSemi = semiFinished.reduce((s, g) => s + g.items.reduce((si, i) => si + i.stock, 0), 0)
  const lowFinished = finished.reduce((s, g) => s + g.items.filter(i => i.stock <= g.low && i.stock > 0).length, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Stock Management</h2>
          <p className="text-gray-500 text-sm mt-1">Semi-finished and finished product inventory</p>
        </div>
        <button
          onClick={() => setShowAdjustModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
        >
          + Adjust Stock
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Finished Products</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{totalFinished} pcs</p>
          <p className="text-xs text-gray-400 mt-1">Ready to sell</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Semi-finished</p>
          <p className="text-2xl font-bold text-orange-500 mt-1">{totalSemi} pcs</p>
          <p className="text-xs text-gray-400 mt-1">Finishing pending</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Low Stock Items</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{lowFinished}</p>
          <p className="text-xs text-gray-400 mt-1">Need attention</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {['finished', 'semi-finished'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'finished' ? '✅ Finished Products' : '🔧 Semi-finished'}
          </button>
        ))}
      </div>

      {/* Stock Groups */}
      <div className="space-y-4">
        {activeTab === 'finished' && (
          <>
            <p className="text-xs text-gray-400">These are ready to sell. Stock reduces when orders are placed.</p>
            {finished.map(p => (
              <StockGroup key={p.code} {...p} showMarkFinished={false} />
            ))}
          </>
        )}
        {activeTab === 'semi-finished' && (
          <>
            <p className="text-xs text-gray-400">Click "Mark Finished →" to move items to finished stock after completing them.</p>
            {semiFinished.map(p => (
              <StockGroup
                key={p.code}
                {...p}
                showMarkFinished={true}
                onMarkFinished={handleMarkFinished}
              />
            ))}
          </>
        )}
      </div>

      {/* Mark as Finished Modal */}
      {showFinishModal && (
        <Modal title="Mark as Finished" onClose={() => setShowFinishModal(false)}>
          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3">
              <p className="text-sm text-indigo-700 font-medium">{finishForm.itemCode} — Size {finishForm.size}</p>
              <p className="text-xs text-indigo-500 mt-0.5">Available semi-finished: {finishForm.maxQty} pcs</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">How many are finished?</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={finishForm.qty}
                onChange={e => setFinishForm({ ...finishForm, qty: e.target.value })}
                placeholder={`Max: ${finishForm.maxQty}`}
                max={finishForm.maxQty}
              />
            </div>
            {finishForm.qty && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Semi-finished</span>
                  <span className="font-bold text-orange-600">
                    {finishForm.maxQty} → {Math.max(0, finishForm.maxQty - parseInt(finishForm.qty))} pcs
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Finished stock</span>
                  <span className="font-bold text-green-600">+{finishForm.qty} pcs added</span>
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleConfirmFinish}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowFinishModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && (
        <Modal title="Adjust Stock (Correction)" onClose={() => setShowAdjustModal(false)}>
          <div className="space-y-4 max-h-[25rem] overflow-y-scroll">
            {/* Stock type */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Stock Type</label>
              <div className="flex gap-2">
                {['finished', 'semi'].map(t => (
                  <button
                    key={t}
                    onClick={() => setForm({ ...form, stockType: t, groupCode: '', itemCode: '' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition capitalize ${
                      form.stockType === t
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-300'
                    }`}
                  >
                    {t === 'finished' ? '✅ Finished' : '🔧 Semi-finished'}
                  </button>
                ))}
              </div>
            </div>

            {/* Add or Remove */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Type</label>
              <div className="flex gap-2">
                {['add', 'remove'].map(t => (
                  <button
                    key={t}
                    onClick={() => setForm({ ...form, type: t })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize border transition ${
                      form.type === t
                        ? t === 'add'
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-gray-600 border-gray-300'
                    }`}
                  >
                    {t === 'add' ? '➕ Add' : '➖ Remove'}
                  </button>
                ))}
              </div>
            </div>

            {/* Group */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Product Group</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.groupCode}
                onChange={e => setForm({ ...form, groupCode: e.target.value, itemCode: '' })}
              >
                <option value="">Select group</option>
                {(form.stockType === 'finished' ? finished : semiFinished).map(g => (
                  <option key={g.code} value={g.code}>{g.group}</option>
                ))}
              </select>
            </div>

            {/* Size */}
            {selectedGroup && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Size</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.itemCode}
                  onChange={e => setForm({ ...form, itemCode: e.target.value })}
                >
                  <option value="">Select size</option>
                  {selectedGroup.items.map(item => (
                    <option key={item.code} value={item.code}>
                      {item.code} — Size {item.size} (Current: {item.stock} {selectedGroup.unit})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Qty */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Quantity</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.qty}
                onChange={e => setForm({ ...form, qty: e.target.value })}
                placeholder="0"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Reason</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
              >
                <option value="">Select reason</option>
                {(form.type === 'add'
                  ? ['New stock','Return from customer', 'Correction', 'Found extra']
                  : ['Damaged', 'Lost', 'Correction']
                ).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAdjustStock}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                Adjust Stock
              </button>
              <button
                onClick={() => setShowAdjustModal(false)}
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

export default Stock