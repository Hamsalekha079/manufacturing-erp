import { useState } from 'react'
import Modal from '../components/Modal'
import { useApp } from '../context/AppContext'
import { Search } from 'lucide-react'

const paymentMethods = ['Cash', 'PhonePe', 'GPay', 'Bank Transfer', 'Cheque']

// ─── ADD EMPLOYEE MODAL ──────────────────────────────────
function AddEmployeeModal({ onClose }) {
  const { addEmployee, products } = useApp()
  const [empForm, setEmpForm] = useState({
    name: '', phone: '', role: '', salaryType: 'DAILY', dailyRate: '',
    assignedProducts: [],
    obPendingSalary: '', obPendingAdvance: '', obDate: '', obNote: ''
  })
  const [newProduct, setNewProduct] = useState({ code: '', rate: '', workType: '' })

  function addProductToForm() {
    if (!newProduct.code || !newProduct.rate || !newProduct.workType) return
    const product = products.find(p => p.code === newProduct.code)
    if (!product) return
    if (empForm.assignedProducts.find(p => p.code === newProduct.code && p.workType === newProduct.workType)) return
    setEmpForm({
      ...empForm,
      assignedProducts: [...empForm.assignedProducts, {
        code: newProduct.code,
        name: `${product.name} ${product.size}`,
        workType: newProduct.workType,
        rate: parseFloat(newProduct.rate)
      }]
    })
    setNewProduct({ code: '', rate: '', workType: '' })
  }

  function handleAdd() {
    if (!empForm.name || !empForm.phone) return
    addEmployee({
      name: empForm.name, phone: empForm.phone, role: empForm.role,
      salaryType: empForm.salaryType,
      dailyRate: empForm.salaryType === 'DAILY' ? parseFloat(empForm.dailyRate || 0) : 0,
      assignedProducts: empForm.salaryType === 'LABOUR' ? empForm.assignedProducts : [],
      obPendingSalary: empForm.obPendingSalary,
      obPendingAdvance: empForm.obPendingAdvance,
      obDate: empForm.obDate,
      obNote: empForm.obNote
    })
    onClose()
  }

  return (
    <Modal title="Add Employee" onClose={onClose}>
      <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Name *</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={empForm.name} onChange={e => setEmpForm({ ...empForm, name: e.target.value })} placeholder="Employee name" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Phone *</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={empForm.phone} onChange={e => setEmpForm({ ...empForm, phone: e.target.value })} placeholder="9876543210" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Role</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={empForm.role} onChange={e => setEmpForm({ ...empForm, role: e.target.value })} placeholder="e.g. Worker, Helper" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Salary Type</label>
            <div className="flex gap-2">
              {['DAILY', 'LABOUR'].map(type => (
                <button key={type} onClick={() => setEmpForm({ ...empForm, salaryType: type })}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition ${empForm.salaryType === type ? type === 'DAILY' ? 'bg-blue-600 text-white border-blue-600' : 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-300'}`}>
                  {type === 'DAILY' ? '📅 Daily Wage' : '🔨 Labour'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {empForm.salaryType === 'DAILY' && (
          <div>
            <label className="text-xs text-gray-500 block mb-1">Daily Rate (₹)</label>
            <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={empForm.dailyRate} onChange={e => setEmpForm({ ...empForm, dailyRate: e.target.value })} placeholder="e.g. 600" />
            {empForm.dailyRate && <p className="text-xs text-gray-400 mt-1">Monthly ≈ ₹{(parseFloat(empForm.dailyRate) * 26).toLocaleString()}</p>}
          </div>
        )}

        {empForm.salaryType === 'LABOUR' && (
          <div className="space-y-2">
            <label className="text-xs text-gray-500 block">Assign Products & Work Type</label>
            <div className="grid grid-cols-3 gap-2">
              <select className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newProduct.code}
                onChange={e => {
                  const product = products.find(p => p.code === e.target.value)
                  let rate = ''
                  if (product && newProduct.workType) {
                    if (newProduct.workType === 'shaping') rate = product.shapingRate
                    else if (newProduct.workType === 'finishing') rate = product.finishingRate
                    else if (newProduct.workType === 'polishing') rate = product.polishingRate
                  }
                  setNewProduct({ ...newProduct, code: e.target.value, rate })
                }}>
                <option value="">Product</option>
                {products.map(p => <option key={p.code} value={p.code}>{p.code} — {p.name} {p.size}</option>)}
              </select>
              <select className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newProduct.workType}
                onChange={e => {
                  const workType = e.target.value
                  const product = products.find(p => p.code === newProduct.code)
                  let rate = ''
                  if (product && workType) {
                    if (workType === 'shaping') rate = product.shapingRate
                    else if (workType === 'finishing') rate = product.finishingRate
                    else if (workType === 'polishing') rate = product.polishingRate
                  }
                  setNewProduct({ ...newProduct, workType, rate })
                }}>
                <option value="">Work Type</option>
                <option value="shaping">🔨 Shaping</option>
                <option value="finishing">✨ Finishing</option>
                <option value="polishing">💎 Polishing</option>
              </select>
              <div className="flex gap-1">
                <input type="number" className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none" placeholder="₹/pc"
                  value={newProduct.rate} onChange={e => setNewProduct({ ...newProduct, rate: e.target.value })} />
                <button onClick={addProductToForm} className="bg-orange-500 text-white px-2 rounded-lg text-sm hover:bg-orange-600">+</button>
              </div>
            </div>
            {empForm.assignedProducts.map((p, i) => (
              <div key={i} className="flex justify-between items-center bg-orange-50 border border-orange-200 rounded-lg px-3 py-1.5 text-xs">
                <span>{p.code} — {p.name} <span className="bg-orange-200 text-orange-700 px-1.5 py-0.5 rounded capitalize ml-1">{p.workType}</span></span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-orange-600">₹{p.rate}/pc</span>
                  <button onClick={() => setEmpForm({ ...empForm, assignedProducts: empForm.assignedProducts.filter((_, idx) => idx !== i) })} className="text-red-400 hover:text-red-600">×</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-dashed border-gray-200 pt-3 space-y-3">
          <p className="text-sm font-medium text-gray-700">Opening Balance <span className="text-xs text-gray-400 font-normal">(optional)</span></p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">💸 I Need to Pay — Pending Salary (₹)</label>
              <input type="number" className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                value={empForm.obPendingSalary} onChange={e => setEmpForm({ ...empForm, obPendingSalary: e.target.value })} placeholder="0" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">💰 They Owe Me — Pending Advance (₹)</label>
              <input type="number" className="w-full border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={empForm.obPendingAdvance} onChange={e => setEmpForm({ ...empForm, obPendingAdvance: e.target.value })} placeholder="0" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Last Salary Date</label>
              <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={empForm.obDate} onChange={e => setEmpForm({ ...empForm, obDate: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Note</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={empForm.obNote} onChange={e => setEmpForm({ ...empForm, obNote: e.target.value })} placeholder="Optional" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleAdd} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Add Employee</button>
          <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm">Cancel</button>
        </div>
      </div>
    </Modal>
  )
}

// ─── PAYMENT HISTORY MODAL ───────────────────────────────
function PaymentModal({ title, totalAmount, paidAmount, payments, saving, onClose, onRecord }) {
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('Cash')
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const balance = totalAmount - paidAmount

  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-4 max-h-[32rem] overflow-y-auto pr-1">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
            <p className="text-xs text-gray-400">Total</p>
            <p className="font-bold text-gray-800">₹{totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 rounded-lg px-3 py-2 text-center">
            <p className="text-xs text-gray-400">Paid</p>
            <p className="font-bold text-green-600">₹{paidAmount.toLocaleString()}</p>
          </div>
          <div className={`rounded-lg px-3 py-2 text-center ${balance > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
            <p className="text-xs text-gray-400">Balance</p>
            <p className={`font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {balance > 0 ? `₹${balance.toLocaleString()}` : '✅ Clear'}
            </p>
          </div>
        </div>

        {payments.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">History ({payments.length})</p>
            <div className="space-y-1">
              {payments.map((p, i) => (
                <div key={i} className="flex justify-between items-center bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-xs font-medium text-gray-700">{p.date}</p>
                    <p className="text-xs text-gray-400">{p.method}{p.note ? ` · ${p.note}` : ''}</p>
                  </div>
                  <p className="text-sm font-bold text-green-600">₹{p.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {balance > 0 && (
          <div className="border-t pt-3 space-y-3">
            <p className="text-sm font-medium text-gray-700">Record Payment</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Amount (₹)</label>
                <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={amount} onChange={e => setAmount(e.target.value)} placeholder={`Max ₹${balance.toLocaleString()}`} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Date</label>
                <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={date} onChange={e => setDate(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Method</label>
              <div className="flex gap-2 flex-wrap">
                {paymentMethods.map(m => (
                  <button key={m} onClick={() => setMethod(m)}
                    className={`px-2 py-1 rounded text-xs border ${method === m ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Note (optional)</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={note} onChange={e => setNote(e.target.value)} placeholder="Any note" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => onRecord({ amount: parseFloat(amount), method, date, note })} disabled={!amount || saving}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Record Payment'}
              </button>
              <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm">Close</button>
            </div>
          </div>
        )}
        {balance <= 0 && (
          <button onClick={onClose} className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg text-sm">Close</button>
        )}
      </div>
    </Modal>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────
export default function Employees() {
  const { employees, bulkAttendance, bulkProduction, generateAllSalary, giveAdvance,
    recordSalaryPayment, recordAdvanceRepayment, openingBalances, products } = useApp()

  const [activeTab, setActiveTab] = useState('employees')
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)

  // Attendance state
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0])
  const [dailyAtt, setDailyAtt] = useState({}) // { empId: 'present'|'half'|'absent' }
  const [labourEntries, setLabourEntries] = useState({}) // { empId: [{ productCode, workType, qty }] }
  const [attSaved, setAttSaved] = useState(false)

  // Salary state
  const [salDateFrom, setSalDateFrom] = useState('')
  const [salDateTo, setSalDateTo] = useState('')
  const [salaryResults, setSalaryResults] = useState([])
  const [salaryGenerated, setSalaryGenerated] = useState(false)

  // Advance modal
  const [showAdvModal, setShowAdvModal] = useState(false)
  const [advForm, setAdvForm] = useState({ employeeId: '', amount: '', date: '', note: '', recoveryType: 'manual' })

  // Payment modals
  const [showSalPayModal, setShowSalPayModal] = useState(null)
  const [showAdvRepayModal, setShowAdvRepayModal] = useState(null)

  // Filter
  const [salFilter, setSalFilter] = useState('all') // all | pending | paid
  const [advFilter, setAdvFilter] = useState('all') // all | pending | recovered

  const dailyEmployees = employees.filter(e => e.salaryType === 'DAILY')
  const labourEmployees = employees.filter(e => e.salaryType === 'LABOUR')

  const totalSalaryPending = employees.reduce((s, emp) => {
    const gen = emp.salaryHistory.reduce((se, h) => se + h.amount, 0)
    const paid = emp.salaryHistory.reduce((sp, h) => sp + (h.paidAmount || 0), 0)
    const obSal = ((openingBalances || {}).employees || []).find(ob => ob.employeeId === emp.id)?.pendingSalary || 0
    return s + (gen - paid) + obSal
  }, 0)

  const totalAdvancePending = employees.reduce((s, emp) => {
    const pending = (emp.advances || []).reduce((sa, a) => {
      const repaid = (a.repayments || []).reduce((sr, r) => sr + r.amount, 0)
      return sa + Math.max(0, a.amount - repaid)
    }, 0)
    const obAdv = ((openingBalances || {}).employees || []).find(ob => ob.employeeId === emp.id)?.pendingAdvance || 0
    return s + pending + obAdv
  }, 0)

  // All flattened data
  const allAdvances = employees.flatMap(emp =>
    (emp.advances || []).map(a => {
      const totalRepaid = (a.repayments || []).reduce((s, r) => s + r.amount, 0)
      return { ...a, empName: emp.name, empId: emp.id, totalRepaid, remaining: Math.max(0, a.amount - totalRepaid) }
    })
  )
  const filteredAdvances = allAdvances.filter(a => {
    const matchSearch = a.empName.toLowerCase().includes(search.toLowerCase())
    const matchFilter = advFilter === 'all' || (advFilter === 'pending' && !a.recovered) || (advFilter === 'recovered' && a.recovered)
    return matchSearch && matchFilter
  })

  const allSalaries = employees.flatMap(emp =>
    emp.salaryHistory.map(s => ({
      ...s, empName: emp.name, empId: emp.id,
      balance: s.amount - (s.paidAmount || 0)
    }))
  )
  const filteredSalaries = allSalaries.filter(s => {
    const matchSearch = s.empName.toLowerCase().includes(search.toLowerCase())
    const matchFilter = salFilter === 'all' || (salFilter === 'pending' && !s.paid) || (salFilter === 'paid' && s.paid)
    return matchSearch && matchFilter
  })

  // Today's attendance status for daily employees
  function getAttStatus(empId) {
    return dailyAtt[empId] || null
  }

  function setAttStatus(empId, status) {
    setDailyAtt(prev => ({ ...prev, [empId]: status }))
    setAttSaved(false)
  }

  function setAllPresent() {
    const updated = {}
    dailyEmployees.forEach(e => { updated[e.id] = 'present' })
    setDailyAtt(updated)
    setAttSaved(false)
  }

  function setAllAbsent() {
    const updated = {}
    dailyEmployees.forEach(e => { updated[e.id] = 'absent' })
    setDailyAtt(updated)
    setAttSaved(false)
  }

  async function saveDailyAttendance() {
    const attendance = Object.entries(dailyAtt).map(([empId, status]) => ({
      employeeId: parseInt(empId), status
    }))
    if (attendance.length === 0) return
    setSaving(true)
    await bulkAttendance(attDate, attendance)
    setSaving(false)
    setAttSaved(true)
  }

  // Labour entries
  function getLabourEntry(empId) {
    return labourEntries[empId] || [{ productCode: '', workType: '', qty: '' }]
  }

  function updateLabourEntry(empId, idx, field, value) {
    const entries = getLabourEntry(empId)
    const updated = entries.map((e, i) => i === idx ? { ...e, [field]: value } : e)
    setLabourEntries(prev => ({ ...prev, [empId]: updated }))
    setAttSaved(false)
  }

  function addLabourRow(empId) {
    const entries = getLabourEntry(empId)
    setLabourEntries(prev => ({ ...prev, [empId]: [...entries, { productCode: '', workType: '', qty: '' }] }))
  }

  function removeLabourRow(empId, idx) {
    const entries = getLabourEntry(empId)
    setLabourEntries(prev => ({ ...prev, [empId]: entries.filter((_, i) => i !== idx) }))
  }

  async function saveLabourAttendance() {
    const entries = []
    labourEmployees.forEach(emp => {
      const rows = getLabourEntry(emp.id)
      rows.forEach(row => {
        if (!row.productCode || !row.qty) return
        const assignedProduct = emp.assignedProducts.find(p => p.code === row.productCode && p.workType === row.workType)
        if (!assignedProduct) return
        entries.push({
          employeeId: emp.id,
          productCode: row.productCode,
          workType: row.workType,
          qty: parseInt(row.qty),
          rate: assignedProduct.rate
        })
      })
    })
    if (entries.length === 0) return
    setSaving(true)
    await bulkProduction(attDate, entries)
    setSaving(false)
    setAttSaved(true)
    setLabourEntries({})
  }

  async function handleGenerateAllSalary() {
    if (!salDateFrom || !salDateTo) return
    setSaving(true)
    const weekLabel = `${salDateFrom} - ${salDateTo}`
    const results = await generateAllSalary(weekLabel, salDateFrom, salDateTo)
    setSalaryResults(results || [])
    setSalaryGenerated(true)
    setSaving(false)
  }

  async function handleGiveAdvance() {
    if (!advForm.employeeId || !advForm.amount) return
    setSaving(true)
    await giveAdvance(parseInt(advForm.employeeId), {
      amount: parseFloat(advForm.amount),
      date: advForm.date,
      note: advForm.note,
      recoveryType: advForm.recoveryType
    })
    setSaving(false)
    setAdvForm({ employeeId: '', amount: '', date: '', note: '', recoveryType: 'manual' })
    setShowAdvModal(false)
  }

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

  const tabs = [
    { id: 'employees', label: `👷 Employees (${employees.length})` },
    { id: 'attendance', label: '📅 Attendance' },
    { id: 'advances', label: '💵 Advances' },
    { id: 'salary', label: '💰 Salary' },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Employees</h2>
          <p className="text-gray-500 text-sm mt-1">Manage staff, attendance, advances and salary</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">+ Add Employee</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Total Employees</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{employees.length}</p>
          <p className="text-xs text-gray-400 mt-1">{dailyEmployees.length} daily · {labourEmployees.length} labour</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Salary Pending</p>
          <p className="text-2xl font-bold text-red-500 mt-1">₹{totalSalaryPending.toLocaleString()}</p>
          <p className="text-xs text-red-400 mt-1">💸 I Need to Pay</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Advance Pending</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">₹{totalAdvancePending.toLocaleString()}</p>
          <p className="text-xs text-purple-400 mt-1">💰 They Owe Me</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Today's Attendance</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {Object.values(dailyAtt).filter(s => s === 'present').length}/{dailyEmployees.length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Present today</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setSearch('') }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap ${activeTab === t.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: EMPLOYEES ── */}
      {activeTab === 'employees' && (
        <div className="space-y-3">
          <div className="relative max-w-sm">
            <input type="text" placeholder="Search employees..." className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={search} onChange={e => setSearch(e.target.value)} />
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs text-gray-400 uppercase">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Rate</th>
                  <th className="px-4 py-3">Salary Due 💸</th>
                  <th className="px-4 py-3">Advance Pending 💰</th>
                  <th className="px-4 py-3">Opening Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase())).map(emp => {
                  const salPaid = emp.salaryHistory.reduce((s, h) => s + (h.paidAmount || 0), 0)
                  const salTotal = emp.salaryHistory.reduce((s, h) => s + h.amount, 0)
                  const salDue = salTotal - salPaid
                  const advPending = (emp.advances || []).reduce((s, a) => {
                    const repaid = (a.repayments || []).reduce((sr, r) => sr + r.amount, 0)
                    return s + Math.max(0, a.amount - repaid)
                  }, 0)
                  const empOB = ((openingBalances || {}).employees || []).find(ob => ob.employeeId === emp.id)
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                            <span className="text-indigo-600 font-bold text-xs">{emp.name[0]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{emp.name}</p>
                            <p className="text-xs text-gray-400">{emp.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{emp.role || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${emp.salaryType === 'DAILY' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                          {emp.salaryType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {emp.salaryType === 'DAILY' ? `₹${emp.dailyRate}/day` : `${emp.assignedProducts.length} products`}
                      </td>
                      <td className="px-4 py-3">{salDue > 0 ? <span className="text-sm font-bold text-red-600">₹{salDue.toLocaleString()}</span> : <span className="text-xs text-green-600">✅ Clear</span>}</td>
                      <td className="px-4 py-3">{advPending > 0 ? <span className="text-sm font-bold text-purple-600">₹{advPending.toLocaleString()}</span> : <span className="text-xs text-green-600">✅ Clear</span>}</td>
                      <td className="px-4 py-3 text-xs">
                        {empOB ? (
                          <div className="space-y-0.5">
                            {empOB.pendingSalary > 0 && <p className="text-red-500">Sal: ₹{empOB.pendingSalary.toLocaleString()}</p>}
                            {empOB.pendingAdvance > 0 && <p className="text-purple-500">Adv: ₹{empOB.pendingAdvance.toLocaleString()}</p>}
                            {!empOB.pendingSalary && !empOB.pendingAdvance && <p className="text-gray-400">—</p>}
                          </div>
                        ) : '—'}
                      </td>
                    </tr>
                  )
                })}
                {employees.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-sm text-gray-400">No employees yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: ATTENDANCE ── */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Date picker */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Date:</label>
              <input type="date" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={attDate} onChange={e => { setAttDate(e.target.value); setAttSaved(false) }} />
            </div>
            {attSaved && <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">✅ Saved!</span>}
          </div>

          {/* SECTION 1: Daily Wage */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="font-semibold text-gray-800">📅 Daily Wage Employees</h3>
              <div className="flex gap-2">
                <button onClick={setAllPresent} className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-200">✅ All Present</button>
                <button onClick={setAllAbsent} className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-200">❌ All Absent</button>
              </div>
            </div>

            {dailyEmployees.length === 0
              ? <p className="text-sm text-gray-400">No daily wage employees</p>
              : (
                <div className="bg-white rounded-xl shadow overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-xs text-gray-400 uppercase">
                        <th className="px-4 py-3">Employee</th>
                        <th className="px-4 py-3">Daily Rate</th>
                        <th className="px-4 py-3 text-center">Present</th>
                        <th className="px-4 py-3 text-center">Half Day</th>
                        <th className="px-4 py-3 text-center">Absent</th>
                        <th className="px-4 py-3">Today Earning</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {dailyEmployees.map(emp => {
                        const status = getAttStatus(emp.id)
                        const earning = status === 'present' ? emp.dailyRate : status === 'half' ? emp.dailyRate / 2 : 0
                        return (
                          <tr key={emp.id} className={`hover:bg-gray-50 ${status === 'present' ? 'bg-green-50' : status === 'half' ? 'bg-yellow-50' : status === 'absent' ? 'bg-red-50' : ''}`}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                  <span className="text-blue-600 font-bold text-xs">{emp.name[0]}</span>
                                </div>
                                <span className="text-sm font-medium text-gray-800">{emp.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">₹{emp.dailyRate}/day</td>
                            <td className="px-4 py-3 text-center">
                              <input type="radio" name={`att-${emp.id}`} checked={status === 'present'}
                                onChange={() => setAttStatus(emp.id, 'present')}
                                className="w-4 h-4 text-green-600 cursor-pointer" />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input type="radio" name={`att-${emp.id}`} checked={status === 'half'}
                                onChange={() => setAttStatus(emp.id, 'half')}
                                className="w-4 h-4 text-yellow-500 cursor-pointer" />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input type="radio" name={`att-${emp.id}`} checked={status === 'absent'}
                                onChange={() => setAttStatus(emp.id, 'absent')}
                                className="w-4 h-4 text-red-500 cursor-pointer" />
                            </td>
                            <td className="px-4 py-3">
                              {status ? (
                                <span className={`text-sm font-bold ${earning > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                  {earning > 0 ? `₹${earning}` : '₹0'}
                                </span>
                              ) : <span className="text-gray-300 text-sm">—</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t">
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-sm font-medium text-gray-600">
                          {Object.values(dailyAtt).filter(s => s === 'present').length} present ·
                          {Object.values(dailyAtt).filter(s => s === 'half').length} half ·
                          {Object.values(dailyAtt).filter(s => s === 'absent').length} absent
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-green-600">
                          ₹{dailyEmployees.reduce((s, emp) => {
                            const status = getAttStatus(emp.id)
                            return s + (status === 'present' ? emp.dailyRate : status === 'half' ? emp.dailyRate / 2 : 0)
                          }, 0).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )
            }

            {dailyEmployees.length > 0 && (
              <button onClick={saveDailyAttendance} disabled={saving || Object.keys(dailyAtt).length === 0}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving...' : '💾 Save Daily Attendance'}
              </button>
            )}
          </div>

          {/* SECTION 2: Labour */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">🔨 Labour Employees — Daily Work Entry</h3>

            {labourEmployees.length === 0
              ? <p className="text-sm text-gray-400">No labour employees</p>
              : (
                <div className="space-y-3">
                  {labourEmployees.map(emp => {
                    const entries = getLabourEntry(emp.id)
                    const totalEarned = entries.reduce((s, row) => {
                      if (!row.productCode || !row.qty) return s
                      const ap = emp.assignedProducts.find(p => p.code === row.productCode && p.workType === row.workType)
                      return s + (ap ? parseInt(row.qty || 0) * ap.rate : 0)
                    }, 0)
                    return (
                      <div key={emp.id} className="bg-white rounded-xl shadow p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                              <span className="text-orange-600 font-bold text-xs">{emp.name[0]}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{emp.name}</p>
                              <p className="text-xs text-gray-400">{emp.assignedProducts.length} products assigned</p>
                            </div>
                          </div>
                          {totalEarned > 0 && <span className="text-sm font-bold text-orange-600">₹{totalEarned.toLocaleString()} today</span>}
                        </div>

                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-xs text-gray-400 uppercase">
                              <th className="pb-2">Product</th>
                              <th className="pb-2">Work Type</th>
                              <th className="pb-2">Rate</th>
                              <th className="pb-2">Qty</th>
                              <th className="pb-2">Amount</th>
                              <th className="pb-2"></th>
                            </tr>
                          </thead>
                          <tbody className="space-y-2">
                            {entries.map((row, idx) => {
                              const ap = emp.assignedProducts.find(p => p.code === row.productCode && p.workType === row.workType)
                              const rowAmount = ap && row.qty ? parseInt(row.qty) * ap.rate : 0
                              return (
                                <tr key={idx}>
                                  <td className="pr-2 pb-2">
                                    <select className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                      value={row.productCode}
                                      onChange={e => {
                                        updateLabourEntry(emp.id, idx, 'productCode', e.target.value)
                                        updateLabourEntry(emp.id, idx, 'workType', '')
                                      }}>
                                      <option value="">Select product</option>
                                      {[...new Set(emp.assignedProducts.map(p => p.code))].map(code => {
                                        const product = products.find(p => p.code === code)
                                        return <option key={code} value={code}>{code} — {product?.name || code}</option>
                                      })}
                                    </select>
                                  </td>
                                  <td className="pr-2 pb-2">
                                    <select className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                      value={row.workType}
                                      onChange={e => updateLabourEntry(emp.id, idx, 'workType', e.target.value)}
                                      disabled={!row.productCode}>
                                      <option value="">Work type</option>
                                      {emp.assignedProducts.filter(p => p.code === row.productCode).map(p => (
                                        <option key={p.workType} value={p.workType}>{p.workType} — ₹{p.rate}/pc</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="pr-2 pb-2 text-sm text-gray-600">
                                    {ap ? `₹${ap.rate}/pc` : '—'}
                                  </td>
                                  <td className="pr-2 pb-2">
                                    <input type="number" min="0"
                                      className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                      value={row.qty}
                                      onChange={e => updateLabourEntry(emp.id, idx, 'qty', e.target.value)}
                                      placeholder="0" />
                                  </td>
                                  <td className="pr-2 pb-2 text-sm font-bold text-orange-600">
                                    {rowAmount > 0 ? `₹${rowAmount.toLocaleString()}` : '—'}
                                  </td>
                                  <td className="pb-2">
                                    {entries.length > 1 && (
                                      <button onClick={() => removeLabourRow(emp.id, idx)} className="text-red-400 hover:text-red-600 text-lg px-1">×</button>
                                    )}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>

                        <button onClick={() => addLabourRow(emp.id)} className="text-xs text-indigo-600 hover:underline">+ Add product row</button>
                      </div>
                    )
                  })}

                  <button onClick={saveLabourAttendance} disabled={saving}
                    className="bg-orange-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-orange-700 disabled:opacity-50">
                    {saving ? 'Saving...' : '💾 Save Labour Entries'}
                  </button>
                </div>
              )
            }
          </div>
        </div>
      )}

      {/* ── TAB: ADVANCES ── */}
      {activeTab === 'advances' && (
        <div className="space-y-3">
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 max-w-sm">
              <input type="text" placeholder="Search employees..." className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={search} onChange={e => setSearch(e.target.value)} />
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="flex gap-1">
              {['all', 'pending', 'recovered'].map(f => (
                <button key={f} onClick={() => setAdvFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${advFilter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {f}
                </button>
              ))}
            </div>
            <button onClick={() => setShowAdvModal(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700">+ Give Advance</button>
          </div>

          {/* Opening balance advances */}
          {((openingBalances || {}).employees || []).filter(ob => ob.pendingAdvance > 0).map(ob => {
            const emp = employees.find(e => e.id === ob.employeeId)
            if (!emp || !emp.name.toLowerCase().includes(search.toLowerCase())) return null
            return (
              <div key={ob.id} className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 flex justify-between items-center">
                <div>
                  <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full">📋 Opening Balance — They Owe Me</span>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{emp.name}</p>
                  {ob.lastDate && <p className="text-xs text-gray-400">as of {ob.lastDate.split('T')[0]}</p>}
                </div>
                <span className="font-bold text-purple-600 text-lg">₹{ob.pendingAdvance.toLocaleString()}</span>
              </div>
            )
          })}

          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs text-gray-400 uppercase">
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Given</th>
                  <th className="px-4 py-3">Repaid</th>
                  <th className="px-4 py-3">Remaining</th>
                  <th className="px-4 py-3">Recovery</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAdvances.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-sm text-gray-400">No advances found</td></tr>}
                {filteredAdvances.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{a.empName}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{a.date}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-800">₹{a.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-green-600">₹{a.totalRepaid.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-bold text-red-500">{a.remaining > 0 ? `₹${a.remaining.toLocaleString()}` : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${a.recoveryType === 'salary' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                        {a.recoveryType === 'salary' ? '✂ Salary' : '🤝 Manual'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${a.recovered ? 'bg-green-100 text-green-700' : a.totalRepaid > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {a.recovered ? '✅ Done' : a.totalRepaid > 0 ? '⏳ Partial' : '⏳ Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setShowAdvRepayModal(a)}
                        className={`px-3 py-1 rounded-lg text-xs ${a.recovered ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-500 text-white hover:bg-purple-600'}`}>
                        {a.recovered ? '📋 History' : '💵 Repayment'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: SALARY ── */}
      {activeTab === 'salary' && (
        <div className="space-y-4">
          {/* Generate salary section */}
          <div className="bg-white rounded-xl shadow p-4 space-y-4">
            <h3 className="font-semibold text-gray-800">Generate Salary for All Employees</h3>
            <div className="flex gap-3 flex-wrap items-end">
              <div>
                <label className="text-xs text-gray-500 block mb-1">From Date</label>
                <input type="date" className={inputCls} value={salDateFrom} onChange={e => { setSalDateFrom(e.target.value); setSalaryGenerated(false) }} style={{ width: 'auto' }} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">To Date</label>
                <input type="date" className={inputCls} value={salDateTo} onChange={e => { setSalDateTo(e.target.value); setSalaryGenerated(false) }} style={{ width: 'auto' }} />
              </div>
              {salDateFrom && salDateTo && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Week Label (auto)</label>
                  <div className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600">
                    {salDateFrom} — {salDateTo}
                  </div>
                </div>
              )}
              <button onClick={handleGenerateAllSalary} disabled={saving || !salDateFrom || !salDateTo}
                className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                {saving ? 'Generating...' : '⚡ Generate for All'}
              </button>
            </div>

            {salaryGenerated && salaryResults.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                <p className="text-sm font-medium text-green-800">✅ Generated for {salaryResults.length} employees</p>
                {salaryResults.map((r, i) => (
                  <div key={i} className="flex justify-between text-xs text-gray-700">
                    <span>{r.empName}</span>
                    <div className="flex gap-3">
                      {r.advanceDeducted > 0 && <span className="text-purple-600">Adv deducted: ₹{r.advanceDeducted.toLocaleString()}</span>}
                      <span className="font-bold text-green-700">Net: ₹{r.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {salaryGenerated && salaryResults.length === 0 && (
              <p className="text-sm text-gray-400">No salary to generate — no attendance/production logs found for this period.</p>
            )}
          </div>

          {/* Filter + search */}
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 max-w-sm">
              <input type="text" placeholder="Search employees..." className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={search} onChange={e => setSearch(e.target.value)} />
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="flex gap-1">
              {['all', 'pending', 'paid'].map(f => (
                <button key={f} onClick={() => setSalFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${salFilter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Opening balance salaries */}
          {((openingBalances || {}).employees || []).filter(ob => ob.pendingSalary > 0).map(ob => {
            const emp = employees.find(e => e.id === ob.employeeId)
            if (!emp || !emp.name.toLowerCase().includes(search.toLowerCase())) return null
            if (salFilter === 'paid') return null
            return (
              <div key={ob.id} className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex justify-between items-center">
                <div>
                  <span className="text-xs bg-orange-200 text-orange-700 px-2 py-0.5 rounded-full">📋 Opening Balance — I Need to Pay</span>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{emp.name}</p>
                  {ob.lastDate && <p className="text-xs text-gray-400">as of {ob.lastDate.split('T')[0]}</p>}
                </div>
                <span className="font-bold text-red-600 text-lg">₹{ob.pendingSalary.toLocaleString()}</span>
              </div>
            )
          })}

          {/* Salary table */}
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs text-gray-400 uppercase">
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Week / Period</th>
                  <th className="px-4 py-3">Gross</th>
                  <th className="px-4 py-3">Advance Cut</th>
                  <th className="px-4 py-3">Paid</th>
                  <th className="px-4 py-3">Balance</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSalaries.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-sm text-gray-400">No salary records found</td></tr>}
                {filteredSalaries.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{s.empName}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{s.week}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-800">₹{(s.amount + (s.advanceDeducted || 0)).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-purple-600">
                      {s.advanceDeducted > 0 ? `- ₹${s.advanceDeducted.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600">₹{(s.paidAmount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-bold text-red-500">{s.balance > 0 ? `₹${s.balance.toLocaleString()}` : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.paid ? 'bg-green-100 text-green-700' : (s.paidAmount || 0) > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {s.paid ? '✅ Paid' : (s.paidAmount || 0) > 0 ? '⏳ Partial' : '❌ Unpaid'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setShowSalPayModal(s)}
                        className={`px-3 py-1 rounded-lg text-xs ${s.paid ? 'bg-indigo-100 text-indigo-600' : 'bg-green-500 text-white hover:bg-green-600'}`}>
                        {s.paid ? '📋 History' : '💰 Pay'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      {showAddModal && <AddEmployeeModal onClose={() => setShowAddModal(false)} />}

      {/* Give Advance Modal */}
      {showAdvModal && (
        <Modal title="Give Advance" onClose={() => setShowAdvModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Employee</label>
              <select className={inputCls} value={advForm.employeeId} onChange={e => setAdvForm({ ...advForm, employeeId: e.target.value })}>
                <option value="">Select employee</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Amount (₹)</label>
              <input type="number" className={inputCls} value={advForm.amount} onChange={e => setAdvForm({ ...advForm, amount: e.target.value })} placeholder="0" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Recovery Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setAdvForm({ ...advForm, recoveryType: 'salary' })}
                  className={`py-3 rounded-lg text-sm font-medium border text-center transition ${advForm.recoveryType === 'salary' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>
                  ✂ Cut from Salary
                  <p className="text-xs font-normal mt-0.5 opacity-80">Auto-deducted on salary generation</p>
                </button>
                <button onClick={() => setAdvForm({ ...advForm, recoveryType: 'manual' })}
                  className={`py-3 rounded-lg text-sm font-medium border text-center transition ${advForm.recoveryType === 'manual' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-300'}`}>
                  🤝 Manual Recovery
                  <p className="text-xs font-normal mt-0.5 opacity-80">Employee repays whenever possible</p>
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Both options can be used — you can cut part from salary and recover rest manually</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Date</label>
                <input type="date" className={inputCls} value={advForm.date} onChange={e => setAdvForm({ ...advForm, date: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Note (optional)</label>
                <input className={inputCls} value={advForm.note} onChange={e => setAdvForm({ ...advForm, note: e.target.value })} placeholder="e.g. Medical" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleGiveAdvance} disabled={saving} className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Give Advance'}
              </button>
              <button onClick={() => setShowAdvModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Salary Payment Modal */}
      {showSalPayModal && (
        <PaymentModal
          title={`Salary — ${showSalPayModal.empName} · ${showSalPayModal.week}`}
          totalAmount={showSalPayModal.amount}
          paidAmount={showSalPayModal.paidAmount || 0}
          payments={showSalPayModal.payments || []}
          saving={saving}
          onClose={() => setShowSalPayModal(null)}
          onRecord={async (data) => {
            setSaving(true)
            await recordSalaryPayment(showSalPayModal.empId, showSalPayModal.id, data)
            setSaving(false)
            setShowSalPayModal(null)
          }}
        />
      )}

      {/* Advance Repayment Modal */}
      {showAdvRepayModal && (
        <PaymentModal
          title={`Advance Repayment — ${showAdvRepayModal.empName}`}
          totalAmount={showAdvRepayModal.amount}
          paidAmount={showAdvRepayModal.totalRepaid}
          payments={(showAdvRepayModal.repayments || []).map(r => ({ ...r, method: r.method || 'Cash' }))}
          saving={saving}
          onClose={() => setShowAdvRepayModal(null)}
          onRecord={async (data) => {
            setSaving(true)
            await recordAdvanceRepayment(showAdvRepayModal.empId, showAdvRepayModal.id, data)
            setSaving(false)
            setShowAdvRepayModal(null)
          }}
        />
      )}
    </div>
  )
}