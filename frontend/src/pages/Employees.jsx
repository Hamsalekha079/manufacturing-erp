import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Modal from '../components/Modal'
import { useApp } from '../context/AppContext'



const paymentMethods = ['Cash', 'PhonePe', 'GPay', 'Bank Transfer']

// ─── EMPLOYEE CARD ───────────────────────────────────────
function EmployeeCard({ emp }) {
  const { logAttendance, logProduction, generateWeeklySalary, paySalary, products } = useApp()
  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('logs')
  const [showAttModal, setShowAttModal] = useState(false)
  const [showProdModal, setShowProdModal] = useState(false)
  const [showGenModal, setShowGenModal] = useState(false)
  const [showPayModal, setShowPayModal] = useState(false)
  const [selectedSalaryId, setSelectedSalaryId] = useState(null)
  const [payMethod, setPayMethod] = useState('Cash')
  const [logPage, setLogPage] = useState(1)
  const [logFilter, setLogFilter] = useState('thisWeek')
  const LOGS_PER_PAGE = 10

  const [attForm, setAttForm] = useState({ date: '', status: 'present' })
  const [prodForm, setProdForm] = useState({ 
    date: '', 
    entries: [{ code: '', qty: '' }] 
  })
  const [genForm, setGenForm] = useState({
    weekLabel: '', dateFrom: '', dateTo: ''
  })

  const unpaidSalaries = emp.salaryHistory.filter(s => !s.paid)
  const totalEarned = emp.salaryHistory.reduce((s, h) => s + h.amount, 0)
  const totalPaid = emp.salaryHistory.filter(s => s.paid).reduce((s, h) => s + h.amount, 0)
  const totalPending = totalEarned - totalPaid

  // current week logs
  const recentAttendance = [...emp.attendanceLogs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7)
  const recentProduction = [...emp.productionLogs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10)

  function handleLogAttendance() {
    if (!attForm.date) return
    logAttendance(emp.id, attForm.date, attForm.status)
    setAttForm({ date: '', status: 'present' })
    setShowAttModal(false)
  }

  function handleLogProduction() {
    if (!prodForm.date || !prodForm.code || !prodForm.qty) return
    const product = emp.assignedProducts.find(p => p.code === prodForm.code)
    logProduction(emp.id, prodForm.date, prodForm.code, product.name, parseInt(prodForm.qty), product.rate)
    setProdForm({ date: '', code: '', qty: '' })
    setShowProdModal(false)
  }

  function handleGenerateSalary() {
    if (!genForm.weekLabel || !genForm.dateFrom || !genForm.dateTo) return
    generateWeeklySalary(emp.id, genForm.weekLabel, genForm.dateFrom, genForm.dateTo)
    setGenForm({ weekLabel: '', dateFrom: '', dateTo: '' })
    setShowGenModal(false)
  }

  function handlePaySalary() {
    if (!selectedSalaryId) return
    paySalary(emp.id, selectedSalaryId, payMethod)
    setShowPayModal(false)
    setSelectedSalaryId(null)
  }

  const dayStyle = {
    present: 'bg-green-100 text-green-700',
    absent: 'bg-red-100 text-red-700',
    half: 'bg-yellow-100 text-yellow-700',
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600 font-bold">{emp.name[0]}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-800">{emp.name}</p>
            <p className="text-xs text-gray-400">{emp.role} · {emp.phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            emp.salaryType === 'DAILY'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-orange-100 text-orange-600'
          }`}>
            {emp.salaryType === 'DAILY' ? `₹${emp.dailyRate}/day` : 'Labour'}
          </span>
          {totalPending > 0 && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
              ₹{totalPending.toLocaleString()} pending
            </span>
          )}
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded */}
      {open && (
        <div className="border-t border-gray-100 p-4 space-y-4">

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            {emp.salaryType === 'DAILY' && (
              <button
                onClick={() => setShowAttModal(true)}
                className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg text-sm hover:bg-blue-100"
              >
                📅 Log Attendance
              </button>
            )}
            {emp.salaryType === 'LABOUR' && (
              <button
                onClick={() => setShowProdModal(true)}
                className="bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1.5 rounded-lg text-sm hover:bg-orange-100"
              >
                🔨 Log Products
              </button>
            )}
            <button
              onClick={() => setShowGenModal(true)}
              className="bg-indigo-50 text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-100"
            >
              📊 Generate Salary
            </button>
            {unpaidSalaries.length > 0 && (
              <button
                onClick={() => setShowPayModal(true)}
                className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-600"
              >
                💰 Pay Salary
              </button>
            )}
          </div>

          {/* Section tabs */}
          <div className="flex gap-2 border-b border-gray-100">
            {['logs', 'salary', 'products'].map(s => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                className={`px-3 py-1.5 text-xs font-medium capitalize border-b-2 transition ${
                  activeSection === s
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-400'
                }`}
              >
                {s === 'logs'
                  ? emp.salaryType === 'DAILY' ? 'Attendance' : 'Production'
                  : s === 'salary' ? 'Salary History'
                  : 'Assigned Products'}
              </button>
            ))}
          </div>

          {/* Logs section */}
          {activeSection === 'logs' && (
  <div className="space-y-3">
    {/* Filter tabs */}
    <div className="flex gap-2">
      {['thisWeek', 'thisMonth', 'all'].map(f => (
        <button
          key={f}
          onClick={() => { setLogFilter(f); setLogPage(1) }}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
            logFilter === f
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {f === 'thisWeek' ? 'This Week' : f === 'thisMonth' ? 'This Month' : 'All Time'}
        </button>
      ))}
    </div>

    {emp.salaryType === 'DAILY' ? (
      (() => {
        const now = new Date()
        const day = now.getDay()
        const monday = new Date(now)
        monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
        const mondayStr = monday.toISOString().split('T')[0]
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

        const filtered = [...emp.attendanceLogs]
          .sort((a, b) => b.date.localeCompare(a.date))
          .filter(l => {
            if (logFilter === 'thisWeek') return l.date >= mondayStr
            if (logFilter === 'thisMonth') return l.date >= firstOfMonth
            return true
          })

        const totalPages = Math.ceil(filtered.length / LOGS_PER_PAGE)
        const paginated = filtered.slice((logPage - 1) * LOGS_PER_PAGE, logPage * LOGS_PER_PAGE)

        const presentCount = filtered.filter(l => l.status === 'present').length
        const halfCount = filtered.filter(l => l.status === 'half').length
        const absentCount = filtered.filter(l => l.status === 'absent').length

        return (
          <div className="space-y-2">
            {/* Summary row */}
            <div className="flex gap-3">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✅ {presentCount} present</span>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">🌓 {halfCount} half</span>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">❌ {absentCount} absent</span>
            </div>

            {filtered.length === 0 ? (
              <p className="text-sm text-gray-400">No attendance logged</p>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2">
                  {paginated.map((l, i) => (
                    <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${
                      l.status === 'present' ? 'bg-green-100 text-green-700'
                      : l.status === 'half' ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                    }`}>
                      <span>{l.date}</span>
                      <span className="font-bold capitalize">{l.status}</span>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-gray-400">{filtered.length} records · Page {logPage}/{totalPages}</p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setLogPage(p => Math.max(1, p - 1))}
                        disabled={logPage === 1}
                        className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
                      >← Prev</button>
                      <button
                        onClick={() => setLogPage(p => Math.min(totalPages, p + 1))}
                        disabled={logPage === totalPages}
                        className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
                      >Next →</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )
      })()
    ) : (
      (() => {
        const now = new Date()
        const day = now.getDay()
        const monday = new Date(now)
        monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
        const mondayStr = monday.toISOString().split('T')[0]
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

        const filtered = [...emp.productionLogs]
          .sort((a, b) => b.date.localeCompare(a.date))
          .filter(l => {
            if (logFilter === 'thisWeek') return l.date >= mondayStr
            if (logFilter === 'thisMonth') return l.date >= firstOfMonth
            return true
          })

        const totalPages = Math.ceil(filtered.length / LOGS_PER_PAGE)
        const paginated = filtered.slice((logPage - 1) * LOGS_PER_PAGE, logPage * LOGS_PER_PAGE)
        const totalEarned = filtered.reduce((s, l) => s + (l.qty * l.rate), 0)

        return (
          <div className="space-y-2">
            {/* Summary */}
            <div className="flex gap-3">
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                {filtered.length} entries
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                ₹{totalEarned.toLocaleString()} earned
              </span>
            </div>

            {filtered.length === 0 ? (
              <p className="text-sm text-gray-400">No production logged</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {paginated.map((l, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded">{l.code}</span>
                          <span className="text-xs text-gray-400">{l.date}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5 truncate max-w-[140px]">{l.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">×{l.qty} @ ₹{l.rate}</p>
                        <p className="text-sm font-bold text-indigo-600">₹{(l.qty * l.rate).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-gray-400">{filtered.length} records · Page {logPage}/{totalPages}</p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setLogPage(p => Math.max(1, p - 1))}
                        disabled={logPage === 1}
                        className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
                      >← Prev</button>
                      <button
                        onClick={() => setLogPage(p => Math.min(totalPages, p + 1))}
                        disabled={logPage === totalPages}
                        className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
                      >Next →</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )
      })()
    )}
  </div>
)}

          {/* Salary history */}
          {activeSection === 'salary' && (
            <div className="space-y-2">
              {emp.salaryHistory.length === 0
                ? <p className="text-sm text-gray-400">No salary generated yet</p>
                : emp.salaryHistory.map((s, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${
                    s.paid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{s.week}</p>
                      {s.paid && <p className="text-xs text-gray-500">Paid on {s.paidDate} · {s.method}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-800">₹{s.amount.toLocaleString()}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        s.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {s.paid ? '✅ Paid' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                ))
              }
              {/* Summary */}
              <div className="flex justify-between bg-gray-50 rounded-lg px-4 py-3 mt-2">
                <span className="text-sm text-gray-600">Total Earned / Paid / Pending</span>
                <span className="text-sm font-bold">
                  ₹{totalEarned.toLocaleString()} /
                  <span className="text-green-600"> ₹{totalPaid.toLocaleString()}</span> /
                  <span className="text-red-500"> ₹{totalPending.toLocaleString()}</span>
                </span>
              </div>
            </div>
          )}

          {/* Assigned products */}
          {activeSection === 'products' && (
            <div>
              {emp.salaryType === 'DAILY'
                ? <p className="text-sm text-gray-400">Daily wage employee — no product assignment needed</p>
                : emp.assignedProducts.length === 0
                  ? <p className="text-sm text-gray-400">No products assigned yet</p>
                  : (
                    <div className="grid grid-cols-3 gap-2">
                      {emp.assignedProducts.map((p, i) => (
                        <div key={i} className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 flex justify-between">
                          <div>
                            <p className="text-xs font-mono text-gray-500">{p.code}</p>
                            <p className="text-sm text-gray-700">{p.name}</p>
                          </div>
                          <p className="text-sm font-bold text-orange-600">₹{p.rate}/pc</p>
                        </div>
                      ))}
                    </div>
                  )
              }
            </div>
          )}
        </div>
      )}

      {/* ── LOG ATTENDANCE MODAL ── */}
      {showAttModal && (
        <Modal title={`Log Attendance — ${emp.name}`} onClose={() => setShowAttModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={attForm.date}
                onChange={e => setAttForm({ ...attForm, date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Status</label>
              <div className="flex gap-2">
                {['present', 'half', 'absent'].map(s => (
                  <button
                    key={s}
                    onClick={() => setAttForm({ ...attForm, status: s })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize border transition ${
                      attForm.status === s
                        ? s === 'present' ? 'bg-green-500 text-white border-green-500'
                          : s === 'half' ? 'bg-yellow-400 text-white border-yellow-400'
                          : 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-gray-600 border-gray-300'
                    }`}
                  >
                    {s === 'present' ? '✅ Present' : s === 'half' ? '🌓 Half' : '❌ Absent'}
                  </button>
                ))}
              </div>
            </div>
            {attForm.date && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex justify-between">
                <span className="text-sm text-blue-700">{attForm.date} — {attForm.status}</span>
                <span className="font-bold text-blue-700">
                  ₹{attForm.status === 'present' ? emp.dailyRate : attForm.status === 'half' ? emp.dailyRate / 2 : 0}
                </span>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={handleLogAttendance} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700">Save</button>
              <button onClick={() => setShowAttModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── LOG PRODUCTION MODAL ── */}
      {/* ── LOG PRODUCTION MODAL ── */}
      {showProdModal && (
        <Modal title={`Log Products — ${emp.name}`} onClose={() => setShowProdModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={prodForm.date}
                onChange={e => setProdForm({ ...prodForm, date: e.target.value })}
              />
            </div>

            {/* Multiple product entries */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Products Made</label>
                <button
                  onClick={() => setProdForm({
                    ...prodForm,
                    entries: [...(prodForm.entries || []), { code: '', qty: '' }]
                  })}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  + Add product
                </button>
              </div>

              <div className="space-y-2">
                {(prodForm.entries || [{ code: '', qty: '' }]).map((entry, i) => (
                  <div key={i} className="flex gap-2 items-center">
                   <select
                      className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={entry.code}
                      onChange={e => {
                        const product = emp.assignedProducts.find(p => p.code === e.target.value)
                        const updated = (prodForm.entries || []).map((en, idx) =>
                          idx === i ? { ...en, code: e.target.value, rate: product?.rate || 0 } : en
                        )
                        setProdForm({ ...prodForm, entries: updated })
                      }}
                    >
                    <option value="">Select product</option>
                      {emp.assignedProducts.map(p => (
                        <option key={p.code} value={p.code}>
                          {p.code} — {p.name} (₹{p.rate}/pc)
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Qty"
                      value={entry.qty}
                      onChange={e => {
                        const updated = (prodForm.entries || [{ code: '', qty: '' }]).map((en, idx) =>
                          idx === i ? { ...en, qty: e.target.value } : en
                        )
                        setProdForm({ ...prodForm, entries: updated })
                      }}
                    />
                    {(prodForm.entries || []).length > 1 && (
                      <button
                        onClick={() => setProdForm({
                          ...prodForm,
                          entries: prodForm.entries.filter((_, idx) => idx !== i)
                        })}
                        className="text-red-400 hover:text-red-600 text-lg px-1"
                      >×</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Live total */}
            {(prodForm.entries || []).some(e => e.code && e.qty) && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 space-y-1">
                {(prodForm.entries || []).filter(e => e.code && e.qty).map((e, i) => {
                  const product = emp.assignedProducts.find(p => p.code === e.code)
                  if (!product) return null
                  return (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">{e.code} × {e.qty} @ ₹{product.rate}</span>
                      <span className="font-medium text-orange-700">₹{(parseInt(e.qty) * product.rate).toLocaleString()}</span>
                    </div>
                  )
                })}
                <div className="flex justify-between text-sm font-bold border-t border-orange-200 pt-1 mt-1">
                  <span className="text-gray-700">Total</span>
                  <span className="text-orange-700">
                    ₹{(prodForm.entries || []).filter(e => e.code && e.qty).reduce((s, e) => {
                      const product = emp.assignedProducts.find(p => p.code === e.code)
                      return s + (product ? parseInt(e.qty) * product.rate : 0)
                    }, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (!prodForm.date) return
                  const entries = (prodForm.entries || []).filter(e => e.code && e.qty)
                  if (entries.length === 0) return
                  entries.forEach(entry => {
                    const product = emp.assignedProducts.find(p => p.code === entry.code)
                    if (product) {
                      logProduction(emp.id, prodForm.date, entry.code, product.name, parseInt(entry.qty), product.rate)
                    }
                  })
                  setProdForm({ date: '', entries: [{ code: '', qty: '' }] })
                  setShowProdModal(false)
                }}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700"
              >
                Save
              </button>
              <button
                onClick={() => setShowProdModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── GENERATE SALARY MODAL ── */}
      {showGenModal && (
        <Modal title={`Generate Salary — ${emp.name}`} onClose={() => setShowGenModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Week Label</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={genForm.weekLabel}
                onChange={e => setGenForm({ ...genForm, weekLabel: e.target.value })}
                placeholder="e.g. May W3 (19-25)"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">From</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={genForm.dateFrom}
                  onChange={e => setGenForm({ ...genForm, dateFrom: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">To</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={genForm.dateTo}
                  onChange={e => setGenForm({ ...genForm, dateTo: e.target.value })}
                />
              </div>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3">
              <p className="text-xs text-indigo-700">
                {emp.salaryType === 'DAILY'
                  ? `Calculates based on attendance between selected dates × ₹${emp.dailyRate}/day`
                  : 'Calculates based on production logs between selected dates × product rates'}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleGenerateSalary} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700">Generate</button>
              <button onClick={() => setShowGenModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── PAY SALARY MODAL ── */}
      {showPayModal && (
        <Modal title={`Pay Salary — ${emp.name}`} onClose={() => setShowPayModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Select Week to Pay</label>
              <div className="space-y-2">
                {unpaidSalaries.map(s => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSalaryId(s.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                      selectedSalaryId === s.id
                        ? 'bg-indigo-50 border-indigo-400'
                        : 'bg-gray-50 border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <span className="text-sm font-medium text-gray-800">{s.week}</span>
                    <span className="font-bold text-red-600">₹{s.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Payment Method</label>
              <div className="flex gap-2 flex-wrap">
                {paymentMethods.map(m => (
                  <button
                    key={m}
                    onClick={() => setPayMethod(m)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                      payMethod === m
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            {selectedSalaryId && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex justify-between">
                <span className="text-sm text-green-700">Amount to pay</span>
                <span className="font-bold text-green-700">
                  ₹{unpaidSalaries.find(s => s.id === selectedSalaryId)?.amount.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={handlePaySalary} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700">Pay Now</button>
              <button onClick={() => setShowPayModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ─────────────────────────────────────
function Employees() {
  const { employees, addEmployee, products } = useApp()
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeTab, setActiveTab] = useState('daily')
  const [empForm, setEmpForm] = useState({
    name: '', phone: '', role: '', salaryType: 'DAILY', dailyRate: '', assignedProducts: []
  })
  const [newProduct, setNewProduct] = useState({ code: '', rate: '', workType: '' })

  function handleAddEmployee() {
    if (!empForm.name || !empForm.phone) return
    addEmployee({
      name: empForm.name, phone: empForm.phone, role: empForm.role,
      salaryType: empForm.salaryType,
      dailyRate: empForm.salaryType === 'DAILY' ? parseFloat(empForm.dailyRate) : 0,
      assignedProducts: empForm.salaryType === 'LABOUR' ? empForm.assignedProducts : []
    })
    setEmpForm({ name: '', phone: '', role: '', salaryType: 'DAILY', dailyRate: '', assignedProducts: [] })
    setShowAddModal(false)
  }

 function addProductToForm() {
  if (!newProduct.code || !newProduct.rate || !newProduct.workType) return
  const product = products.find(p => p.code === newProduct.code)
  if (!product) return
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

  function removeProductFromForm(code, workType) {
  setEmpForm({
    ...empForm,
    assignedProducts: empForm.assignedProducts.filter(p => !(p.code === code && p.workType === workType))
  })
}

  const dailyEmployees = employees.filter(e => e.salaryType === 'DAILY')
  console.log('All attendance logs:', dailyEmployees.flatMap(e => e.attendanceLogs).map(l => l.date + ' ' + l.status))
  const labourEmployees = employees.filter(e => e.salaryType === 'LABOUR')

  const totalPending = employees.reduce((s, emp) => {
    const earned = emp.salaryHistory.reduce((se, h) => se + h.amount, 0)
    const paid = emp.salaryHistory.filter(h => h.paid).reduce((sp, h) => sp + h.amount, 0)
    return s + (earned - paid)
  }, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Employees</h2>
          <p className="text-gray-500 text-sm mt-1">Manage staff, attendance and salary</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
        >
          + Add Employee
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Total Employees</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{employees.length}</p>
          <p className="text-xs text-gray-400 mt-1">{dailyEmployees.length} daily · {labourEmployees.length} labour</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Salary Pending</p>
          <p className="text-2xl font-bold text-red-500 mt-1">₹{totalPending.toLocaleString()}</p>
        </div>
        {/* <div className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500">This Week Attendance</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {(() => {
                const now = new Date()
                const day = now.getDay()
                const monday = new Date(now)
                monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
                const sunday = new Date(monday)
                sunday.setDate(monday.getDate() + 6)
                const mondayStr = monday.toISOString().split('T')[0]
                const sundayStr = sunday.toISOString().split('T')[0]
                return dailyEmployees.reduce((s, e) =>
                  s + e.attendanceLogs.filter(l =>
                    l.status === 'present' &&
                    l.date >= mondayStr &&
                    l.date <= sundayStr
                  ).length, 0)
              })()} days
            </p>
            <p className="text-xs text-gray-400 mt-1">Across {dailyEmployees.length} daily employees</p>
          </div> */}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {['daily', 'labour'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'daily' ? `📅 Daily Wage (${dailyEmployees.length})` : `🔨 Labour (${labourEmployees.length})`}
          </button>
        ))}
      </div>

      {/* Employee list */}
      <div className="space-y-3">
        {(activeTab === 'daily' ? dailyEmployees : labourEmployees).map(emp => (
          <EmployeeCard key={emp.id} emp={emp} />
        ))}
      </div>

      {/* ── ADD EMPLOYEE MODAL ── */}
      {showAddModal && (
        <Modal title="Add New Employee" onClose={() => setShowAddModal(false)}>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Name</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={empForm.name}
                  onChange={e => setEmpForm({ ...empForm, name: e.target.value })}
                  placeholder="Employee name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Phone</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={empForm.phone}
                  onChange={e => setEmpForm({ ...empForm, phone: e.target.value })}
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Role</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={empForm.role}
                onChange={e => setEmpForm({ ...empForm, role: e.target.value })}
                placeholder="e.g. Operator, Worker, Helper"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Salary Type</label>
              <div className="flex gap-2">
                {['DAILY', 'LABOUR'].map(type => (
                  <button
                    key={type}
                    onClick={() => setEmpForm({ ...empForm, salaryType: type })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                      empForm.salaryType === type
                        ? type === 'DAILY'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-600 border-gray-300'
                    }`}
                  >
                    {type === 'DAILY' ? '📅 Daily Wage' : '🔨 Labour'}
                  </button>
                ))}
              </div>
            </div>

            {empForm.salaryType === 'DAILY' && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Daily Rate (₹)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={empForm.dailyRate}
                  onChange={e => setEmpForm({ ...empForm, dailyRate: e.target.value })}
                  placeholder="e.g. 600"
                />
                {empForm.dailyRate && (
                  <p className="text-xs text-gray-400 mt-1">
                    Monthly ≈ ₹{(parseFloat(empForm.dailyRate) * 26).toLocaleString()} (26 working days)
                  </p>
                )}
              </div>
            )}

            {empForm.salaryType === 'LABOUR' && (
  <div className="space-y-3">
    <label className="text-sm font-medium text-gray-700 block">Assign Products & Work Type</label>
    <div className="grid grid-cols-3 gap-2">
      <select
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={newProduct.code}
        onChange={e => {
  const product = products.find(p => p.code === e.target.value)
  let rate = ''
  if (product && newProduct.workType) {
    if (newProduct.workType === 'shaping') rate = product.shapingRate
    else if (newProduct.workType === 'finishing') rate = product.finishingRate
    else if (newProduct.workType === 'polishing') rate = product.polishingRate
  }
  setNewProduct({ ...newProduct, code: e.target.value, rate })
}}
      >
        <option value="">Select product</option>
        {products
          .filter(p => !empForm.assignedProducts.find(ap => ap.code === p.code && ap.workType === newProduct.workType))
          .map(p => (
            <option key={p.code} value={p.code}>
              {p.code} — {p.name} {p.size}
            </option>
          ))
        }
      </select>

      <select
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={newProduct.workType || ''}
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
}}
      >
        <option value="">Work type</option>
        <option value="shaping">🔨 Shaping</option>
        <option value="finishing">✨ Finishing</option>
        <option value="polishing">💎 Polishing</option>
      </select>

      <div className="flex gap-2">
        <input
          type="number"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="₹/pc"
          value={newProduct.rate}
          onChange={e => setNewProduct({ ...newProduct, rate: e.target.value })}
        />
        <button
          onClick={addProductToForm}
          className="bg-orange-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-orange-600 whitespace-nowrap"
        >
          Add
        </button>
      </div>
    </div>

    {empForm.assignedProducts.length > 0 && (
      <div className="space-y-1">
        {empForm.assignedProducts.map((p, i) => (
          <div key={i} className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
            <span className="text-sm text-gray-700">
              {p.code} — {p.name}
              <span className="ml-2 text-xs bg-orange-200 text-orange-700 px-2 py-0.5 rounded-full capitalize">
                {p.workType}
              </span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-orange-600">₹{p.rate}/pc</span>
              <button
                onClick={() => removeProductFromForm(p.code, p.workType)}
                className="text-red-400 hover:text-red-600 text-lg"
              >×</button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleAddEmployee}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              Add Employee
            </button>
            <button
              onClick={() => setShowAddModal(false)}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Employees