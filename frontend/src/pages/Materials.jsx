import { useState,useEffect  } from 'react'
import Modal from '../components/Modal'
import { ChevronDown, ChevronUp, Icon , Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { api } from '../api'

const suppliers = []
const castingCenters = []
// ─── REUSABLE COMPONENTS ────────────────────────────────

function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex gap-2 border-b border-gray-200">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
            active === tab
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

function StatusBadge({ paid, total }) {
  const balance = total - paid
  const isPaid = balance === 0
  const isPartial = paid > 0 && balance > 0
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
      isPaid ? 'bg-green-100 text-green-600'
      : isPartial ? 'bg-yellow-100 text-yellow-600'
      : 'bg-red-100 text-red-600'
    }`}>
      {isPaid ? 'Paid' : isPartial ? 'Partial' : 'Pending'}
    </span>
  )
}

// ─── TAB 1: RAW MATERIAL ────────────────────────────────
function RawMaterialTab() {
  const [receivingEntry, setReceivingEntry] = useState(null)
const [receiveKg, setReceiveKg] = useState('')
  const { suppliers, setSuppliers, addSupplier, addSupplierPurchase } = useApp()
  const [payingEntry, setPayingEntry] = useState(null)
const [payAmount, setPayAmount] = useState('')
  const [showAddSupplier, setShowAddSupplier] = useState(false)
const [supplierForm, setSupplierForm] = useState({ name: '', phone: '', paymentMode: 'POSTPAID' })
// const { suppliers } = useApp()
  const [search, setSearch] = useState('')
  
  const [showModal, setShowModal] = useState(false)
  const [openSuppliers, setOpenSuppliers] = useState({})
  const [form, setForm] = useState({
    supplierName: '', materialType: 'Copper',
    orderedKg: '', receivedKg: '', pricePerKg: '', date: ''
  })

 async function handleSubmit() {
  if (!form.supplierName || !form.receivedKg || !form.pricePerKg) return
  const supplier = suppliers.find(s => s.name === form.supplierName)
  if (!supplier) return
  const receivedKg = parseFloat(form.receivedKg)
  const pricePerKg = parseFloat(form.pricePerKg)
  await addSupplierPurchase({
    supplierId: supplier.id,
    materialType: form.materialType,
    orderedKg: parseFloat(form.orderedKg || form.receivedKg),
    receivedKg,
    pricePerKg,
    totalAmount: receivedKg * pricePerKg,
    date: form.date || new Date().toISOString().split('T')[0]
  })
  setOpenSuppliers(prev => ({ ...prev, [form.supplierName]: true }))
  setForm({ supplierName: '', materialType: 'Copper', orderedKg: '', receivedKg: '', pricePerKg: '', date: '' })
  setShowModal(false)
}

  function toggleSupplier(name) {
    setOpenSuppliers(prev => ({ ...prev, [name]: !prev[name] }))
  }

const grouped = suppliers
  .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
  .map(s => ({
    ...s,
    entries: s.entries || []
  }))

  const allEntries = suppliers.flatMap(s => s.entries || [])
const totalOrdered = allEntries.reduce((s, e) => s + e.orderedKg, 0)
const totalReceived = allEntries.reduce((s, e) => s + e.receivedKg, 0)
const totalCost = allEntries.reduce((s, e) => s + e.totalAmount, 0)
const totalPaid = allEntries.reduce((s, e) => s + e.paidAmount, 0)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Total Ordered</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalOrdered} kg</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Total Received</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{totalReceived} kg</p>
          {totalReceived !== totalOrdered && (
            <p className={`text-xs mt-1 ${totalReceived > totalOrdered ? 'text-blue-500' : 'text-orange-500'}`}>
              {totalReceived > totalOrdered
                ? `+${totalReceived - totalOrdered} kg extra`
                : `${totalOrdered - totalReceived} kg pending`}
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Total Cost</p>
          <p className="text-2xl font-bold text-red-500 mt-1">₹{totalCost.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Based on received kg</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Balance Due</p>
          <p className="text-2xl font-bold text-orange-500 mt-1">₹{(totalCost - totalPaid).toLocaleString()}</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Suppliers</h3>
        <div>
          {/* <div style={{ position: "relative",width: "200px", display: "inline-block", marginRight: "10px" }}>
           <input
              type="text"
              placeholder="Search suppliers..."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mr-2"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search
            className="cursor-pointer bg-indigo-600"
              size={25}
              style={{
                position: "absolute",
                right: "20px",
                top: "50%",            
                transform: "translateY(-50%)",
                color: "#ffffff",
                padding: "4px",
                borderRadius: "4px",
              }}
            />
            </div> */}
           <div className="flex justify-between items-center">
  {/* <h3 className="font-semibold text-gray-800">Suppliers</h3> */}
  <div className="flex items-center gap-2">
    <div className="relative">
      <input
        type="text"
        placeholder="Search suppliers..."
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <Search size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
    <button
      onClick={() => setShowAddSupplier(true)}
      className="bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg text-sm hover:bg-indigo-50"
    >
      + Add Supplier
    </button>
    <button
      onClick={() => setShowModal(true)}
      className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
    >
      + Add Purchase
    </button>
  </div>
</div>
        </div>
        
      </div>

      {/* Supplier wise accordion */}
      <div className="space-y-3">
        {grouped.map(supplier => {
          const supplierTotal = supplier.entries.reduce((s, e) => s + e.totalAmount, 0)
          const supplierPaid = supplier.entries.reduce((s, e) => s + e.paidAmount, 0)
          const supplierBalance = supplierTotal - supplierPaid
          const isOpen = openSuppliers[supplier.name]

          return (
            <div key={supplier.id} className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => toggleSupplier(supplier.name)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                    <span className="text-teal-600 font-bold">{supplier.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{supplier.name}</p>
                    <p className="text-xs text-gray-400">{supplier.phone}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    supplier.paymentMode === 'PREPAID'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {supplier.paymentMode}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Total / Paid / Balance</p>
                    <p className="text-sm font-bold">
                      ₹{supplierTotal.toLocaleString()} /
                      <span className="text-green-600"> ₹{supplierPaid.toLocaleString()}</span> /
                      <span className="text-red-500"> ₹{supplierBalance.toLocaleString()}</span>
                    </p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {supplier.entries.length} entries
                  </span>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-gray-100 overflow-x-scroll">
                  {supplier.entries.length === 0 ? (
                    <p className="text-sm text-gray-400 px-5 py-4">No entries yet</p>
                  ) : (
                    <table className="w-full ]">
                      <thead className="bg-gray-50">
                        <tr className="text-left text-xs text-gray-400 uppercase">
                          <th className="px-5 py-3">Date</th>
                          <th className="px-5 py-3">Ordered</th>
                          <th className="px-5 py-3">Received</th>
                          <th className="px-5 py-3">Diff</th>
                          <th className="px-5 py-3">Rate/kg</th>
                          <th className="px-5 py-3">Total</th>
                          <th className="px-5 py-3">Paid</th>
                          <th className="px-5 py-3">Balance</th>
                          <th className="px-5 py-3">Status</th>
                          <th className="px-5 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 ">
                        {supplier.entries.map(e => {
                          const diff = e.receivedKg - e.orderedKg
                          return (
                            <tr key={e.id} className="hover:bg-gray-50">
                              <td className="px-5 py-3 text-sm text-gray-400">{e.date}</td>
                              <td className="px-5 py-3 text-sm text-gray-600">{e.orderedKg} kg</td>
                              <td className="px-5 py-3 text-sm text-green-600 font-medium">{e.receivedKg} kg</td>
                              <td className="px-5 py-3 text-sm">
                                {diff === 0 ? (
                                  <span className="text-gray-400">—</span>
                                ) : diff > 0 ? (
                                  <span className="text-blue-500 font-medium">+{diff} kg extra</span>
                                ) : (
                                  <span className="text-orange-500 font-medium">{diff} kg pending</span>
                                )}
                              </td>
                              <td className="px-5 py-3 text-sm text-gray-600">₹{e.pricePerKg}</td>
                              <td className="px-5 py-3 text-sm font-bold text-gray-800">₹{e.totalAmount.toLocaleString()}</td>
                              <td className="px-5 py-3 text-sm text-green-600">₹{e.paidAmount.toLocaleString()}</td>
                              <td className="px-5 py-3 text-sm font-bold text-red-500">
                                {e.totalAmount - e.paidAmount > 0
                                  ? `₹${(e.totalAmount - e.paidAmount).toLocaleString()}`
                                  : '-'}
                              </td>
                              <td className="px-5 py-3">
                                <StatusBadge paid={e.paidAmount} total={e.totalAmount} />
                              </td>
                    <td className="px-5 py-3">
  <div className="flex gap-1">
    {(() => {
      const diff = e.receivedKg - e.orderedKg
      const pendingKg = diff < 0 ? Math.abs(diff) : 0
      return pendingKg > 0 ? (
        <button
          onClick={() => { setReceivingEntry(e); setReceiveKg('') }}
          className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-600"
        >
          📦 Receive
        </button>
      ) : null
    })()}
    {e.totalAmount - e.paidAmount > 0 && (
      <button
        onClick={() => { setPayingEntry(e); setPayAmount('') }}
        className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-600"
      >
        💰 Pay
      </button>
    )}
  </div>
</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {receivingEntry && (
  <Modal title="Receive Pending Material" onClose={() => setReceivingEntry(null)}>
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Originally Ordered</span>
          <span className="font-bold">{receivingEntry.orderedKg} kg</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Already Received</span>
          <span className="font-bold text-green-600">{receivingEntry.receivedKg} kg</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Pending</span>
          <span className="font-bold text-orange-500">
            {Math.abs(receivingEntry.receivedKg - receivingEntry.orderedKg)} kg
          </span>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          How many kg received now?
        </label>
        <input
          type="number"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={receiveKg}
          onChange={e => setReceiveKg(e.target.value)}
          placeholder={`Max: ${Math.abs(receivingEntry.receivedKg - receivingEntry.orderedKg)} kg`}
        />
      </div>

      {receiveKg && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">New Total Received</span>
            <span className="font-bold text-indigo-600">
              {receivingEntry.receivedKg + parseFloat(receiveKg)} kg
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Remaining Pending</span>
            <span className="font-bold text-orange-500">
              {Math.max(0, receivingEntry.orderedKg - receivingEntry.receivedKg - parseFloat(receiveKg))} kg
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Additional Cost</span>
            <span className="font-bold text-red-500">
              ₹{(parseFloat(receiveKg) * receivingEntry.pricePerKg).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={async () => {
            if (!receiveKg) return
            try {
              const updated = await api.receivePendingKg(receivingEntry.id, parseFloat(receiveKg))
              setSuppliers(prev => prev.map(s => ({
                ...s,
                entries: (s.entries || []).map(e =>
                  e.id === receivingEntry.id
                    ? { ...e, receivedKg: updated.receivedKg, totalAmount: updated.totalAmount }
                    : e
                )
              })))
              setReceivingEntry(null)
              setReceiveKg('')
            } catch (err) {
              console.error('Failed to receive kg:', err)
            }
          }}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Confirm Receipt
        </button>
        <button
          onClick={() => setReceivingEntry(null)}
          className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  </Modal>
)}

      {/* Modal */}
      {showModal && (
        <Modal title="Add Raw Material Purchase" onClose={() => setShowModal(false)}>
          <div className="space-y-4 overflow-y-auto max-h-[60vh]">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Supplier</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.supplierName}
                onChange={e => setForm({ ...form, supplierName: e.target.value })}
              >
                <option value="">Select supplier</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Material Type</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.materialType}
                onChange={e => setForm({ ...form, materialType: e.target.value })}
                placeholder="e.g. Copper"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Ordered (kg)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.orderedKg}
                  onChange={e => setForm({ ...form, orderedKg: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Actually Received (kg)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.receivedKg}
                  onChange={e => setForm({ ...form, receivedKg: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Show diff */}
            {form.orderedKg && form.receivedKg && (
              <div className={`rounded-lg px-4 py-2 text-sm ${
                parseFloat(form.receivedKg) > parseFloat(form.orderedKg)
                  ? 'bg-blue-50 text-blue-700'
                  : parseFloat(form.receivedKg) < parseFloat(form.orderedKg)
                  ? 'bg-orange-50 text-orange-700'
                  : 'bg-green-50 text-green-700'
              }`}>
                {parseFloat(form.receivedKg) > parseFloat(form.orderedKg)
                  ? `✓ Received ${parseFloat(form.receivedKg) - parseFloat(form.orderedKg)} kg extra`
                  : parseFloat(form.receivedKg) < parseFloat(form.orderedKg)
                  ? `⚠ ${parseFloat(form.orderedKg) - parseFloat(form.receivedKg)} kg still pending with supplier`
                  : '✓ Exact amount received'}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Price per kg (₹)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.pricePerKg}
                onChange={e => setForm({ ...form, pricePerKg: e.target.value })}
                placeholder="0"
              />
            </div>

            {/* Live calculation */}
            {form.receivedKg && form.pricePerKg && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 flex justify-between">
                <span className="text-sm text-indigo-700">
                  Total ({form.receivedKg} kg × ₹{form.pricePerKg})
                </span>
                <span className="font-bold text-indigo-700">
                  ₹{(parseFloat(form.receivedKg) * parseFloat(form.pricePerKg)).toLocaleString()}
                </span>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                Add Purchase
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
      {showAddSupplier && (
  <Modal title="Add Supplier" onClose={() => setShowAddSupplier(false)}>
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Supplier Name</label>
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={supplierForm.name}
          onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })}
          placeholder="e.g. Ravi Kumar"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Phone</label>
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={supplierForm.phone}
          onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })}
          placeholder="9876543210"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Payment Mode</label>
        <div className="flex gap-2">
          {['PREPAID', 'POSTPAID'].map(mode => (
            <button
              key={mode}
              onClick={() => setSupplierForm({ ...supplierForm, paymentMode: mode })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                supplierForm.paymentMode === mode
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          onClick={async () => {
            if (!supplierForm.name) return
            try {
             await addSupplier(supplierForm)
              setSupplierForm({ name: '', phone: '', paymentMode: 'POSTPAID' })
              setShowAddSupplier(false)
            } catch (err) {
              console.error('Failed to add supplier:', err)
            }
          }}
          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          Add Supplier
        </button>
        <button
          onClick={() => setShowAddSupplier(false)}
          className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  </Modal>
)}

{showAddSupplier && (
  <Modal title="Add Supplier" onClose={() => setShowAddSupplier(false)}>
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Supplier Name</label>
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={supplierForm.name}
          onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })}
          placeholder="e.g. Ravi Kumar"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Phone</label>
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={supplierForm.phone}
          onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })}
          placeholder="9876543210"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Payment Mode</label>
        <div className="flex gap-2">
          {['PREPAID', 'POSTPAID'].map(mode => (
            <button
              key={mode}
              onClick={() => setSupplierForm({ ...supplierForm, paymentMode: mode })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                supplierForm.paymentMode === mode
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          onClick={async () => {
            if (!supplierForm.name) return
            try {
              const newSupplier = await api.addSupplier(supplierForm)
              setSuppliers(prev => [...prev, { ...newSupplier, entries: [] }])
              setSupplierForm({ name: '', phone: '', paymentMode: 'POSTPAID' })
              setShowAddSupplier(false)
            } catch (err) {
              console.error('Failed to add supplier:', err)
            }
          }}
          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          Add Supplier
        </button>
        <button
          onClick={() => setShowAddSupplier(false)}
          className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  </Modal>
)}

{payingEntry && (
  <Modal title="Record Payment" onClose={() => setPayingEntry(null)}>
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg px-4 py-3 flex justify-between">
        <span className="text-sm text-gray-600">Balance due</span>
        <span className="font-bold text-red-600">
          ₹{(payingEntry.totalAmount - payingEntry.paidAmount).toLocaleString()}
        </span>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Amount (₹)</label>
        <input
          type="number"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={payAmount}
          onChange={e => setPayAmount(e.target.value)}
          placeholder={`Max: ₹${(payingEntry.totalAmount - payingEntry.paidAmount).toLocaleString()}`}
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={async () => {
  if (!payAmount) return
  try {
    const updated = await api.recordSupplierPayment(payingEntry.id, parseFloat(payAmount))
    // Update suppliers context
    setSuppliers(prev => prev.map(s => ({
      ...s,
      entries: (s.entries || []).map(e =>
        e.id === payingEntry.id ? { ...e, paidAmount: updated.paidAmount } : e
      )
    })))
    setPayingEntry(null)
    setPayAmount('')
  } catch (err) {
    console.error('Failed to record payment:', err)
  }
}}
          className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700"
        >
          Record Payment
        </button>
        <button
          onClick={() => setPayingEntry(null)}
          className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm"
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

// ─── TAB 2: CASTING ROUND 1 ─────────────────────────────
function CastingRound1Tab() {
  const { castingCenters, addCastingEntry, addCastingCenter, setCastingCenters } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [showAddCenter, setShowAddCenter] = useState(false)
  const [openCenters, setOpenCenters] = useState({})
  const [search, setSearch] = useState('')
  const [payingEntry, setPayingEntry] = useState(null)
  const [payAmount, setPayAmount] = useState('')
  const [receivingEntry, setReceivingEntry] = useState(null)
  const [receiveKg, setReceiveKg] = useState('')
  const [centerForm, setCenterForm] = useState({ name: '', phone: '' })
  const [form, setForm] = useState({
    centerName: '', sentKg: '', returnedKg: '', ratePerKg: '', date: ''
  })

  async function handleSubmit() {
    if (!form.centerName || !form.sentKg || !form.ratePerKg) return
    const center = castingCenters.find(c => c.name === form.centerName)
    if (!center) return
    const sentKg = parseFloat(form.sentKg)
    const returnedKg = parseFloat(form.returnedKg || 0)
    const ratePerKg = parseFloat(form.ratePerKg)
    await addCastingEntry({
      centerId: center.id,
      type: 'ROUND1',
      sentKg,
      returnedKg,
      ratePerKg,
      date: form.date || new Date().toISOString().split('T')[0]
    })
    setOpenCenters(prev => ({ ...prev, [form.centerName]: true }))
    setForm({ centerName: '', sentKg: '', returnedKg: '', ratePerKg: '', date: '' })
    setShowModal(false)
  }

  function toggleCenter(name) {
    setOpenCenters(prev => ({ ...prev, [name]: !prev[name] }))
  }

  const filtered = castingCenters.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filtered.map(c => ({
    ...c,
    entries: (c.entries || []).filter(e => e.type === 'ROUND1')
  }))

  const allEntries = castingCenters.flatMap(c =>
    (c.entries || []).filter(e => e.type === 'ROUND1')
  )
  const totalSent = allEntries.reduce((s, e) => s + e.sentKg, 0)
  const totalReturned = allEntries.reduce((s, e) => s + e.returnedKg, 0)
  const totalPending = allEntries.reduce((s, e) => s + e.pendingKg, 0)
  const totalExtra = allEntries.reduce((s, e) => s + (e.extraKg || 0), 0)
  const totalCharges = allEntries.reduce((s, e) => s + e.totalAmount, 0)
  const totalPaid = allEntries.reduce((s, e) => s + e.paidAmount, 0)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Sent to Casting</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalSent} kg</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Returned</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{totalReturned} kg</p>
          {totalExtra > 0 && (
            <p className="text-xs text-blue-500 mt-1">+{totalExtra} kg extra</p>
          )}
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Pending with them</p>
          <p className="text-2xl font-bold text-orange-500 mt-1">{totalPending} kg</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Charges Due</p>
          <p className="text-2xl font-bold text-red-500 mt-1">₹{(totalCharges - totalPaid).toLocaleString()}</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Casting Centers</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search centers..."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={() => setShowAddCenter(true)}
            className="bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg text-sm hover:bg-indigo-50"
          >
            + Add Center
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
          >
            + Add Entry
          </button>
        </div>
      </div>

      {/* Center wise accordion */}
      <div className="space-y-3">
        {grouped.map(center => {
          const cTotal = center.entries.reduce((s, e) => s + e.totalAmount, 0)
          const cPaid = center.entries.reduce((s, e) => s + e.paidAmount, 0)
          const cPending = center.entries.reduce((s, e) => s + e.pendingKg, 0)
          const cExtra = center.entries.reduce((s, e) => s + (e.extraKg || 0), 0)
          const isOpen = openCenters[center.name]

          return (
            <div key={center.id} className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => toggleCenter(center.name)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 font-bold">{center.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{center.name}</p>
                    <p className="text-xs text-gray-400">{center.phone}</p>
                  </div>
                  {cPending > 0 && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                      {cPending} kg pending
                    </span>
                  )}
                  {cExtra > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                      +{cExtra} kg extra
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Charges / Paid / Balance</p>
                    <p className="text-sm font-bold">
                      ₹{cTotal.toLocaleString()} /
                      <span className="text-green-600"> ₹{cPaid.toLocaleString()}</span> /
                      <span className="text-red-500"> ₹{(cTotal - cPaid).toLocaleString()}</span>
                    </p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {center.entries.length} entries
                  </span>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-gray-100">
                  {center.entries.length === 0 ? (
                    <p className="text-sm text-gray-400 px-5 py-4">No entries yet</p>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr className="text-left text-xs text-gray-400 uppercase">
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Sent</th>
                          <th className="px-4 py-3">Returned</th>
                          <th className="px-4 py-3">Diff</th>
                          <th className="px-4 py-3">Rate/kg</th>
                          <th className="px-4 py-3">Charges</th>
                          <th className="px-4 py-3">Paid</th>
                          <th className="px-4 py-3">Balance</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {center.entries.map(e => {
                          const diff = e.returnedKg - e.sentKg
                          return (
                            <tr key={e.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-400">{e.date}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{e.sentKg} kg</td>
                              <td className="px-4 py-3 text-sm text-green-600 font-medium">{e.returnedKg} kg</td>
                              <td className="px-4 py-3 text-sm">
                                {diff === 0 ? (
                                  <span className="text-gray-400">—</span>
                                ) : diff > 0 ? (
                                  <span className="text-blue-500 font-medium">+{diff} kg extra</span>
                                ) : (
                                  <span className="text-orange-500 font-medium">{Math.abs(diff)} kg pending</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">₹{e.ratePerKg}</td>
                              <td className="px-4 py-3 text-sm font-bold text-gray-800">₹{e.totalAmount.toLocaleString()}</td>
                              <td className="px-4 py-3 text-sm text-green-600">₹{e.paidAmount.toLocaleString()}</td>
                              <td className="px-4 py-3 text-sm font-bold text-red-500">
                                {e.totalAmount - e.paidAmount > 0
                                  ? `₹${(e.totalAmount - e.paidAmount).toLocaleString()}`
                                  : '-'}
                              </td>
                              <td className="px-4 py-3">
                                <StatusBadge paid={e.paidAmount} total={e.totalAmount} />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1">
                                  {e.pendingKg > 0 && (
                                    <button
                                      onClick={() => { setReceivingEntry(e); setReceiveKg('') }}
                                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                                    >
                                      📦 Receive
                                    </button>
                                  )}
                                  {e.totalAmount - e.paidAmount > 0 && (
                                    <button
                                      onClick={() => { setPayingEntry(e); setPayAmount('') }}
                                      className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                                    >
                                      💰 Pay
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add Center Modal */}
      {showAddCenter && (
        <Modal title="Add Casting Center" onClose={() => setShowAddCenter(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Center Name</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={centerForm.name}
                onChange={e => setCenterForm({ ...centerForm, name: e.target.value })}
                placeholder="e.g. Bhaskar"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Phone</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={centerForm.phone}
                onChange={e => setCenterForm({ ...centerForm, phone: e.target.value })}
                placeholder="9876543210"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={async () => {
                  if (!centerForm.name) return
                  await addCastingCenter(centerForm)
                  setCenterForm({ name: '', phone: '' })
                  setShowAddCenter(false)
                }}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                Add Center
              </button>
              <button
                onClick={() => setShowAddCenter(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Entry Modal */}
      {showModal && (
        <Modal title="Add Casting Entry" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Casting Center</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.centerName}
                onChange={e => setForm({ ...form, centerName: e.target.value })}
              >
                <option value="">Select center</option>
                {castingCenters.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Sent (kg)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.sentKg}
                  onChange={e => setForm({ ...form, sentKg: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Returned (kg)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.returnedKg}
                  onChange={e => setForm({ ...form, returnedKg: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            {form.sentKg && form.returnedKg && (
              <div className={`rounded-lg px-4 py-2 text-sm ${
                parseFloat(form.returnedKg) > parseFloat(form.sentKg)
                  ? 'bg-blue-50 text-blue-700'
                  : parseFloat(form.returnedKg) < parseFloat(form.sentKg)
                  ? 'bg-orange-50 text-orange-700'
                  : 'bg-green-50 text-green-700'
              }`}>
                {parseFloat(form.returnedKg) > parseFloat(form.sentKg)
                  ? `✓ Returned ${parseFloat(form.returnedKg) - parseFloat(form.sentKg)} kg extra`
                  : parseFloat(form.returnedKg) < parseFloat(form.sentKg)
                  ? `⚠ ${parseFloat(form.sentKg) - parseFloat(form.returnedKg)} kg still pending`
                  : '✓ Exact amount returned'}
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Rate per kg (₹)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.ratePerKg}
                onChange={e => setForm({ ...form, ratePerKg: e.target.value })}
                placeholder="0"
              />
            </div>
            {form.sentKg && form.ratePerKg && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 flex justify-between">
                <span className="text-sm text-indigo-700">
                  Total charges ({form.sentKg} kg × ₹{form.ratePerKg})
                </span>
                <span className="font-bold text-indigo-700">
                  ₹{(parseFloat(form.sentKg) * parseFloat(form.ratePerKg)).toLocaleString()}
                </span>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSubmit} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                Add Entry
              </button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Pay Modal */}
      {payingEntry && (
        <Modal title="Record Payment" onClose={() => setPayingEntry(null)}>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg px-4 py-3 flex justify-between">
              <span className="text-sm text-gray-600">Balance due</span>
              <span className="font-bold text-red-600">
                ₹{(payingEntry.totalAmount - payingEntry.paidAmount).toLocaleString()}
              </span>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Amount (₹)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                placeholder={`Max: ₹${(payingEntry.totalAmount - payingEntry.paidAmount).toLocaleString()}`}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!payAmount) return
                  try {
                    const updated = await api.recordCastingPayment(payingEntry.id, parseFloat(payAmount))
                    setCastingCenters(prev => prev.map(c => ({
                      ...c,
                      entries: (c.entries || []).map(e =>
                        e.id === payingEntry.id ? { ...e, paidAmount: updated.paidAmount } : e
                      )
                    })))
                    setPayingEntry(null)
                    setPayAmount('')
                  } catch (err) {
                    console.error('Failed to record payment:', err)
                  }
                }}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700"
              >
                Record Payment
              </button>
              <button onClick={() => setPayingEntry(null)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Receive Pending Modal */}
      {receivingEntry && (
        <Modal title="Receive Pending Material" onClose={() => setReceivingEntry(null)}>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sent</span>
                <span className="font-bold">{receivingEntry.sentKg} kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Already Returned</span>
                <span className="font-bold text-green-600">{receivingEntry.returnedKg} kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pending</span>
                <span className="font-bold text-orange-500">{receivingEntry.pendingKg} kg</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">How many kg returned now?</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={receiveKg}
                onChange={e => setReceiveKg(e.target.value)}
                placeholder={`Max: ${receivingEntry.pendingKg} kg`}
              />
            </div>
            {receiveKg && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">New Total Returned</span>
                  <span className="font-bold text-indigo-600">
                    {receivingEntry.returnedKg + parseFloat(receiveKg)} kg
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Remaining Pending</span>
                  <span className="font-bold text-orange-500">
                    {Math.max(0, receivingEntry.pendingKg - parseFloat(receiveKg))} kg
                  </span>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!receiveKg) return
                  try {
                    const updated = await api.receivePendingCasting(receivingEntry.id, parseFloat(receiveKg))
                    setCastingCenters(prev => prev.map(c => ({
                      ...c,
                      entries: (c.entries || []).map(e =>
                        e.id === receivingEntry.id
                          ? { ...e, returnedKg: updated.returnedKg, pendingKg: updated.pendingKg, extraKg: updated.extraKg }
                          : e
                      )
                    })))
                    setReceivingEntry(null)
                    setReceiveKg('')
                  } catch (err) {
                    console.error('Failed to receive kg:', err)
                  }
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Confirm Receipt
              </button>
              <button onClick={() => setReceivingEntry(null)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── TAB 3: WASTE & CASTING ROUND 2 ─────────────────────
function WasteCastingTab() {
  const { castingCenters } = useApp()
  const [entries, setEntries] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [openCenters, setOpenCenters] = useState({})
  const [form, setForm] = useState({
    centerName: '', wasteKg: '', returnedKg: '', ratePerKg: '', date: ''
  })

  function handleSubmit() {
    if (!form.centerName || !form.wasteKg || !form.ratePerKg) return
    const wasteKg = parseFloat(form.wasteKg)
    const returnedKg = parseFloat(form.returnedKg || 0)
    const ratePerKg = parseFloat(form.ratePerKg)
    const newEntry = {
      id: Date.now(),
      centerName: form.centerName,
      wasteKg,
      returnedKg,
      pendingKg: wasteKg - returnedKg,
      ratePerKg,
      totalAmount: wasteKg * ratePerKg,
      paidAmount: 0,
      date: form.date || new Date().toISOString().split('T')[0]
    }
    setEntries([newEntry, ...entries])
    setOpenCenters(prev => ({ ...prev, [form.centerName]: true }))
    setForm({ centerName: '', wasteKg: '', returnedKg: '', ratePerKg: '', date: '' })
    setShowModal(false)
  }

  function toggleCenter(name) {
    setOpenCenters(prev => ({ ...prev, [name]: !prev[name] }))
  }

  const grouped = castingCenters.map(c => ({
    ...c,
    entries: entries.filter(e => e.centerName === c.name)
  }))

  const totalWaste = 0
  const totalSent = entries.reduce((s, e) => s + e.wasteKg, 0)
  const totalReturned = entries.reduce((s, e) => s + e.returnedKg, 0)
  const totalPending = entries.reduce((s, e) => s + e.pendingKg, 0)
  const totalCharges = entries.reduce((s, e) => s + e.totalAmount, 0)
  const totalPaid = entries.reduce((s, e) => s + e.paidAmount, 0)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Total Waste</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalWaste} kg</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Sent to Casting</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{totalSent} kg</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Returned</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{totalReturned} kg</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Pending with them</p>
          <p className="text-2xl font-bold text-orange-500 mt-1">{totalPending} kg</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Waste Casting Centers</h3>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
        >
          + Add Entry
        </button>
      </div>

      {/* Center wise accordion */}
      <div className="space-y-3">
        {grouped.map(center => {
          const cTotal = center.entries.reduce((s, e) => s + e.totalAmount, 0)
          const cPaid = center.entries.reduce((s, e) => s + e.paidAmount, 0)
          const cPending = center.entries.reduce((s, e) => s + e.pendingKg, 0)
          const isOpen = openCenters[center.name]

          return (
            <div key={center.id} className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => toggleCenter(center.name)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-600 font-bold">{center.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{center.name}</p>
                    <p className="text-xs text-gray-400">{center.phone}</p>
                  </div>
                  {cPending > 0 && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                      {cPending} kg pending
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Charges / Paid / Balance</p>
                    <p className="text-sm font-bold">
                      ₹{cTotal.toLocaleString()} /
                      <span className="text-green-600"> ₹{cPaid.toLocaleString()}</span> /
                      <span className="text-red-500"> ₹{(cTotal - cPaid).toLocaleString()}</span>
                    </p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {center.entries.length} entries
                  </span>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-gray-100">
                  {center.entries.length === 0 ? (
                    <p className="text-sm text-gray-400 px-5 py-4">No entries yet</p>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr className="text-left text-xs text-gray-400 uppercase">
                          <th className="px-5 py-3">Date</th>
                          <th className="px-5 py-3">Waste Sent</th>
                          <th className="px-5 py-3">Returned</th>
                          <th className="px-5 py-3">Pending</th>
                          <th className="px-5 py-3">Rate/kg</th>
                          <th className="px-5 py-3">Charges</th>
                          <th className="px-5 py-3">Paid</th>
                          <th className="px-5 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {center.entries.map(e => (
                          <tr key={e.id} className="hover:bg-gray-50">
                            <td className="px-5 py-3 text-sm text-gray-400">{e.date}</td>
                            <td className="px-5 py-3 text-sm text-gray-600">{e.wasteKg} kg</td>
                            <td className="px-5 py-3 text-sm text-green-600">{e.returnedKg} kg</td>
                            <td className="px-5 py-3 text-sm font-bold text-orange-500">{e.pendingKg} kg</td>
                            <td className="px-5 py-3 text-sm text-gray-600">₹{e.ratePerKg}</td>
                            <td className="px-5 py-3 text-sm font-bold text-gray-800">₹{e.totalAmount.toLocaleString()}</td>
                            <td className="px-5 py-3 text-sm text-green-600">₹{e.paidAmount.toLocaleString()}</td>
                            <td className="px-5 py-3"><StatusBadge paid={e.paidAmount} total={e.totalAmount} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title="Add Waste Casting Entry" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Casting Center</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.centerName}
                onChange={e => setForm({ ...form, centerName: e.target.value })}
              >
                <option value="">Select center</option>
                {castingCenters.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Waste Sent (kg)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.wasteKg}
                  onChange={e => setForm({ ...form, wasteKg: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Returned (kg)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.returnedKg}
                  onChange={e => setForm({ ...form, returnedKg: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Rate per kg (₹)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.ratePerKg}
                onChange={e => setForm({ ...form, ratePerKg: e.target.value })}
                placeholder="0"
              />
            </div>

            {form.wasteKg && form.ratePerKg && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-amber-700">Total Charges</span>
                  <span className="font-bold text-amber-700">
                    ₹{(parseFloat(form.wasteKg) * parseFloat(form.ratePerKg)).toLocaleString()}
                  </span>
                </div>
                {form.returnedKg && (
                  <div className="flex justify-between">
                    <span className="text-sm text-orange-600">Pending with them</span>
                    <span className="font-bold text-orange-600">
                      {parseFloat(form.wasteKg) - parseFloat(form.returnedKg)} kg
                    </span>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                Add Entry
              </button>
              <button
                onClick={() => setShowModal(false)}
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
// ─── TAB 4: PRODUCTION ──────────────────────────────────
function ProductionTab() {
  
const { categories, products, reloadStock } = useApp()
  // const { categories, products } = useApp()
  const [runs, setRuns] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    category: '', productCode: '', productsMade: '',
    stockType: 'semi', materialUsedKg: '', wasteKg: '', date: ''
  })

  async function handleSubmit() {
  if (!form.productCode || !form.productsMade) return
  try {
    const qty = parseInt(form.productsMade)
    // Add to stock via API
    await api.adjustStock({
      type: form.stockType,
      productCode: form.productCode,
      adjustType: 'add',
      qty
    })
    await reloadStock() // reload stock from backend
    // Add production run record
    const newRun = await api.addProduction({
      productType: form.category,
      materialUsedKg: parseFloat(form.materialUsedKg || 0),
      productsMade: qty,
      wasteKg: parseFloat(form.wasteKg || 0),
      date: form.date || new Date().toISOString().split('T')[0]
    })
    setRuns(prev => [{ ...newRun, date: newRun.date.split('T')[0] }, ...prev])

    // Reload stock from backend to reflect changes
    const stockData = await api.getStock()
    setSemiFinished(groupStock(stockData.semi))
    setFinished(groupStock(stockData.finished))

    setForm({ category: '', productCode: '', productsMade: '', stockType: 'semi', materialUsedKg: '', wasteKg: '', date: '' })
    setShowModal(false)
  } catch (err) {
    console.error('Failed to add production run:', err)
  }
}

  // Load production runs from backend
  useEffect(() => {
    api.getProduction().then(data => {
      setRuns(data.map(r => ({ ...r, date: r.date.split('T')[0] })))
    }).catch(err => console.error(err))
  }, [])

  const categoryProducts = products.filter(p => p.category === form.category)
  const totalMaterial = runs.reduce((s, p) => s + p.materialUsedKg, 0)
  const totalProducts = runs.reduce((s, p) => s + p.productsMade, 0)
  const totalWaste = runs.reduce((s, p) => s + p.wasteKg, 0)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Total Material Used</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalMaterial} kg</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Total Products Made</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{totalProducts} pcs</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Total Waste</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{totalWaste} kg</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-5 border-b flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Production Runs</h3>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
          >
            + New Run
          </button>
        </div>
        {runs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No production runs yet</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs text-gray-400 uppercase">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Product Type</th>
                <th className="px-5 py-3">Material Used</th>
                <th className="px-5 py-3">Products Made</th>
                <th className="px-5 py-3">Waste</th>
                <th className="px-5 py-3">Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {runs.map(p => {
                const efficiency = p.materialUsedKg > 0
                  ? (((p.materialUsedKg - p.wasteKg) / p.materialUsedKg) * 100).toFixed(1)
                  : 0
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm text-gray-400">{p.date}</td>
                    <td className="px-5 py-3 text-sm font-medium text-gray-800">{p.productType}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{p.materialUsedKg} kg</td>
                    <td className="px-5 py-3 text-sm font-bold text-indigo-600">{p.productsMade} pcs</td>
                    <td className="px-5 py-3 text-sm text-red-500">{p.wasteKg} kg</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${efficiency}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{efficiency}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title="Add Production Run" onClose={() => setShowModal(false)}>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">

            {/* Step 1: Category */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value, productCode: '' })}
              >
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Step 2: Product Code */}
            {form.category && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Product Code</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.productCode}
                  onChange={e => setForm({ ...form, productCode: e.target.value })}
                >
                  <option value="">Select product</option>
                  {categoryProducts.map(p => (
                    <option key={p.code} value={p.code}>
                      {p.code} — Size {p.size}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Step 3: Stock Type */}
            {form.productCode && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Add to Stock As</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setForm({ ...form, stockType: 'semi' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                      form.stockType === 'semi'
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-600 border-gray-300'
                    }`}
                  >
                    🔨 Semi-Finished
                  </button>
                  <button
                    onClick={() => setForm({ ...form, stockType: 'finished' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                      form.stockType === 'finished'
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-white text-gray-600 border-gray-300'
                    }`}
                  >
                    ✅ Finished
                  </button>
                </div>
              </div>
            )}

            {/* Qty + Material + Waste */}
            {form.productCode && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Qty Made</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={form.productsMade}
                      onChange={e => setForm({ ...form, productsMade: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Material Used (kg)</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={form.materialUsedKg}
                      onChange={e => setForm({ ...form, materialUsedKg: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Waste (kg)</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={form.wasteKg}
                      onChange={e => setForm({ ...form, wasteKg: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                  />
                </div>

                {/* Preview */}
                {form.productsMade && (
                  <div className={`rounded-lg px-4 py-3 space-y-1 border ${
                    form.stockType === 'semi'
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <p className={`text-sm font-medium ${
                      form.stockType === 'semi' ? 'text-orange-700' : 'text-green-700'
                    }`}>
                      {form.stockType === 'semi' ? '🔨 Semi-Finished' : '✅ Finished'} Stock
                    </p>
                    <p className="text-sm text-gray-600">
                      +{form.productsMade} pcs of <strong>{form.productCode}</strong> will be added
                    </p>
                    {form.materialUsedKg && form.productsMade && (
                      <p className="text-xs text-gray-500">
                        {(parseFloat(form.materialUsedKg) / parseInt(form.productsMade)).toFixed(2)} kg per piece
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                Add Run
              </button>
              <button
                onClick={() => setShowModal(false)}
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
// ─── MAIN COMPONENT ─────────────────────────────────────
function Materials() {
  const [activeTab, setActiveTab] = useState('raw material')

  const tabs = ['raw material', 'casting', 'production','waste & casting']

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Materials</h2>
        <p className="text-gray-500 text-sm mt-1">Track raw material, casting and production</p>
      </div>

      <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'raw material' && <RawMaterialTab />}
      {activeTab === 'casting' && <CastingRound1Tab />}
     
      {activeTab === 'production' && <ProductionTab />}
       {activeTab === 'waste & casting' && <WasteCastingTab />}
    </div>
  )
}

export default Materials