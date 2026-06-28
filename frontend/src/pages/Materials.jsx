import { useState } from 'react'
import Modal from '../components/Modal'
import { ChevronDown, ChevronUp, Icon , Search } from 'lucide-react'
import { useApp } from '../context/AppContext'

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
  const { suppliers } = useApp()
  const [search, setSearch] = useState('')
  const [entries, setEntries] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [openSuppliers, setOpenSuppliers] = useState({})
  const [form, setForm] = useState({
    supplierName: '', materialType: 'Copper',
    orderedKg: '', receivedKg: '', pricePerKg: '', date: ''
  })

  function handleSubmit() {
    if (!form.supplierName || !form.receivedKg || !form.pricePerKg) return
    const receivedKg = parseFloat(form.receivedKg)
    const pricePerKg = parseFloat(form.pricePerKg)
    const newEntry = {
      id: Date.now(),
      supplierName: form.supplierName,
      materialType: form.materialType,
      orderedKg: parseFloat(form.orderedKg || form.receivedKg),
      receivedKg,
      pricePerKg,
      totalAmount: receivedKg * pricePerKg,
      paidAmount: 0,
      date: form.date || new Date().toISOString().split('T')[0]
    }
    setEntries([newEntry, ...entries])
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
    entries: entries.filter(e => e.supplierName === s.name)
  }))
  

  const totalOrdered = entries.reduce((s, e) => s + e.orderedKg, 0)
  const totalReceived = entries.reduce((s, e) => s + e.receivedKg, 0)
  const totalCost = entries.reduce((s, e) => s + e.totalAmount, 0)
  const totalPaid = entries.reduce((s, e) => s + e.paidAmount, 0)

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
          <div style={{ position: "relative",width: "200px", display: "inline-block", marginRight: "10px" }}>
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
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
            >
              + Add Purchase
            </button>
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
                <div className="border-t border-gray-100">
                  {supplier.entries.length === 0 ? (
                    <p className="text-sm text-gray-400 px-5 py-4">No entries yet</p>
                  ) : (
                    <table className="w-full">
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
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
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

      {/* Modal */}
      {showModal && (
        <Modal title="Add Raw Material Purchase" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
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
    </div>
  )
}

// ─── TAB 2: CASTING ROUND 1 ─────────────────────────────
function CastingRound1Tab() {
  const { castingCenters } = useApp()
  const [search, setSearch] = useState('')
  const [entries, setEntries] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [openCenters, setOpenCenters] = useState({})
  const [form, setForm] = useState({
    centerName: '', sentKg: '', returnedKg: '', ratePerKg: '', date: ''
  })

  function handleSubmit() {
    if (!form.centerName || !form.sentKg || !form.ratePerKg) return
    const sentKg = parseFloat(form.sentKg)
    const returnedKg = parseFloat(form.returnedKg || 0)
    const ratePerKg = parseFloat(form.ratePerKg)
    const pendingKg = Math.max(0, sentKg - returnedKg)
    const extraKg = Math.max(0, returnedKg - sentKg)
    const newEntry = {
      id: Date.now(),
      centerName: form.centerName,
      sentKg,
      returnedKg,
      pendingKg,
      extraKg,
      ratePerKg,
      totalAmount: sentKg * ratePerKg,
      paidAmount: 0,
      date: form.date || new Date().toISOString().split('T')[0]
    }
    setEntries([newEntry, ...entries])
    setOpenCenters(prev => ({ ...prev, [form.centerName]: true }))
    setForm({ centerName: '', sentKg: '', returnedKg: '', ratePerKg: '', date: '' })
    setShowModal(false)
  }

  function toggleCenter(name) {
    setOpenCenters(prev => ({ ...prev, [name]: !prev[name] }))
  }

  const grouped = castingCenters
  .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
  .map(c => ({
    ...c,
    entries: entries.filter(e => e.centerName === c.name)
  }))

  const totalSent = entries.reduce((s, e) => s + e.sentKg, 0)
  const totalReturned = entries.reduce((s, e) => s + e.returnedKg, 0)
  const totalPending = entries.reduce((s, e) => s + e.pendingKg, 0)
  const totalExtra = entries.reduce((s, e) => s + (e.extraKg || 0), 0)
  const totalCharges = entries.reduce((s, e) => s + e.totalAmount, 0)
  const totalPaid = entries.reduce((s, e) => s + e.paidAmount, 0)

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
            <p className="text-xs text-blue-500 mt-1">+{totalExtra} kg extra returned</p>
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

      {/* Modal */}
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

            {/* Diff indicator */}
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
                  ? `⚠ ${parseFloat(form.sentKg) - parseFloat(form.returnedKg)} kg still pending with ${form.centerName || 'center'}`
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
  const [runs, setRuns] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    productType: '', materialUsedKg: '', productsMade: '', wasteKg: '', date: ''
  })

  function handleSubmit() {
    if (!form.productType || !form.materialUsedKg || !form.productsMade) return
    const newRun = {
      id: Date.now(),
      date: form.date || new Date().toISOString().split('T')[0],
      materialUsedKg: parseFloat(form.materialUsedKg),
      productType: form.productType,
      productsMade: parseInt(form.productsMade),
      wasteKg: parseFloat(form.wasteKg || 0),
    }
    setRuns([newRun, ...runs])
    setForm({ productType: '', materialUsedKg: '', productsMade: '', wasteKg: '', date: '' })
    setShowModal(false)
  }

  const productGroups = [
    'Kalash - Standard', 'Kalash - Light Weight', 'Kalash - Asta Lakshmi',
    'Panchapatra', 'Glass', 'Plate', 'Spoon', 'Kubera Kuncham'
  ]

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
              const efficiency = (((p.materialUsedKg - p.wasteKg) / p.materialUsedKg) * 100).toFixed(1)
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
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title="Add Production Run" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Product Type</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.productType}
                onChange={e => setForm({ ...form, productType: e.target.value })}
              >
                <option value="">Select product type</option>
                {productGroups.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                <label className="text-sm font-medium text-gray-700 block mb-1">Products Made</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.productsMade}
                  onChange={e => setForm({ ...form, productsMade: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                />
              </div>
            </div>

            {/* Live calculation */}
            {form.materialUsedKg && form.productsMade && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-indigo-700">Material per product</span>
                  <span className="font-bold text-indigo-700">
                    {(parseFloat(form.materialUsedKg) / parseInt(form.productsMade)).toFixed(2)} kg/pc
                  </span>
                </div>
                {form.wasteKg && (
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Efficiency</span>
                    <span className="font-bold text-green-700">
                      {(((parseFloat(form.materialUsedKg) - parseFloat(form.wasteKg)) / parseFloat(form.materialUsedKg)) * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
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