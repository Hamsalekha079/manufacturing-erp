import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function InvestCard({ label, amount, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:shadow transition ${color}`}
    >
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="font-bold text-gray-800">₹{amount.toLocaleString()}</p>
    </div>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const { income, expenses, customers, finished } = useApp()

  // ─── FINANCE CALCULATIONS ─────────────────────────────
  const totalIncome = income.reduce((s, i) => s + i.amount, 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const profit = totalIncome - totalExpenses

  const expenseByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})

  // ─── SALES CALCULATIONS ───────────────────────────────
  const allOrders = customers.flatMap(c => c.orders || [])
  const totalBilled = allOrders.reduce((s, o) => s + o.totalAmount, 0)
  const totalReceived = allOrders.reduce((s, o) =>
    s + (o.payments || []).reduce((sp, p) => sp + p.amount, 0), 0)
  const totalPending = totalBilled - totalReceived
  const totalOverdue = allOrders
    .filter(o => {
      const paid = (o.payments || []).reduce((s, p) => s + p.amount, 0)
      return paid < o.totalAmount && o.dueDate && new Date(o.dueDate) < new Date()
    })
    .reduce((s, o) => {
      const paid = (o.payments || []).reduce((sp, p) => sp + p.amount, 0)
      return s + (o.totalAmount - paid)
    }, 0)

  // ─── STOCK OVERVIEW ───────────────────────────────────
  const stockGroups = finished.map(group => ({
    code: group.code,
    group: group.group,
    unit: group.unit || 'pcs',
    low: group.low || 10,
    stock: group.items.reduce((s, i) => s + i.stock, 0)
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">Business overview at a glance</p>
      </div>

      {/* Top Summary Row */}
      <div className="grid grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/finance')}
          className="bg-white rounded-xl shadow p-5 cursor-pointer hover:shadow-md transition border-l-4 border-red-400"
        >
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="text-2xl font-bold text-red-500 mt-1">₹{totalExpenses.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Click to see breakdown →</p>
        </div>
        <div
          onClick={() => navigate('/sales')}
          className="bg-white rounded-xl shadow p-5 cursor-pointer hover:shadow-md transition border-l-4 border-green-400"
        >
          <p className="text-sm text-gray-500">Total Collection</p>
          <p className="text-2xl font-bold text-green-600 mt-1">₹{totalReceived.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Click to see details →</p>
        </div>
        <div className={`rounded-xl shadow p-5 border-l-4 ${profit >= 0 ? 'bg-indigo-50 border-indigo-400' : 'bg-red-50 border-red-400'}`}>
          <p className="text-sm text-gray-500">Net Profit</p>
          <p className={`text-2xl font-bold mt-1 ${profit >= 0 ? 'text-indigo-600' : 'text-red-500'}`}>
            ₹{Math.abs(profit).toLocaleString()}
            <span className="text-sm font-normal ml-1">{profit >= 0 ? 'profit' : 'loss'}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">All time</p>
        </div>
      </div>

      {/* Invest + Collection Side by Side */}
      <div className="grid grid-cols-2 gap-6">
        {/* INVEST BREAKDOWN */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Expense Breakdown</h3>
            <button onClick={() => navigate('/finance')} className="text-indigo-600 text-sm hover:underline">
              View all →
            </button>
          </div>
          <div className="space-y-2">
            <InvestCard label="Raw Material" amount={expenseByCategory['Material'] || 0} color="bg-blue-50 border-blue-200" onClick={() => navigate('/materials')} />
            <InvestCard label="Casting Charges" amount={expenseByCategory['Casting'] || 0} color="bg-purple-50 border-purple-200" onClick={() => navigate('/materials')} />
            <InvestCard label="Salaries" amount={expenseByCategory['Salary'] || 0} color="bg-orange-50 border-orange-200" onClick={() => navigate('/employees')} />
            <InvestCard label="Transport" amount={expenseByCategory['Transport'] || 0} color="bg-yellow-50 border-yellow-200" onClick={() => navigate('/sales')} />
            <InvestCard label="Other" amount={expenseByCategory['Other'] || 0} color="bg-gray-50 border-gray-200" onClick={() => navigate('/finance')} />
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800 mt-2">
              <p className="text-sm font-medium text-gray-200">Total Expenses</p>
              <p className="font-bold text-white">₹{totalExpenses.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* COLLECTION BREAKDOWN */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Collection Breakdown</h3>
            <button onClick={() => navigate('/sales')} className="text-indigo-600 text-sm hover:underline">
              View all →
            </button>
          </div>
          <div className="space-y-2">
            <div onClick={() => navigate('/sales')} className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-200 cursor-pointer hover:shadow transition">
              <p className="text-sm font-medium text-gray-700">Total Billed</p>
              <p className="font-bold text-gray-800">₹{totalBilled.toLocaleString()}</p>
            </div>
            <div onClick={() => navigate('/sales')} className="flex items-center justify-between p-4 rounded-lg bg-blue-50 border border-blue-200 cursor-pointer hover:shadow transition">
              <p className="text-sm font-medium text-gray-700">Received</p>
              <p className="font-bold text-green-600">₹{totalReceived.toLocaleString()}</p>
            </div>
            <div onClick={() => navigate('/sales')} className="flex items-center justify-between p-4 rounded-lg bg-yellow-50 border border-yellow-200 cursor-pointer hover:shadow transition">
              <p className="text-sm font-medium text-gray-700">Pending</p>
              <p className="font-bold text-yellow-600">₹{totalPending.toLocaleString()}</p>
            </div>
            <div onClick={() => navigate('/sales')} className="flex items-center justify-between p-4 rounded-lg bg-red-50 border border-red-200 cursor-pointer hover:shadow transition">
              <p className="text-sm font-medium text-gray-700">Overdue</p>
              <p className="font-bold text-red-600">₹{totalOverdue.toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800 mt-2">
              <p className="text-sm font-medium text-gray-200">Balance to Collect</p>
              <p className="font-bold text-white">₹{totalPending.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Overview */}
      {stockGroups.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Stock Overview</h3>
            <button onClick={() => navigate('/stock')} className="text-indigo-600 text-sm hover:underline">
              View all →
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {stockGroups.map(item => {
              const isLow = item.stock <= item.low
              return (
                <div
                  key={item.code}
                  onClick={() => navigate('/stock')}
                  className={`p-4 rounded-lg border cursor-pointer hover:shadow transition ${
                    isLow ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <p className="text-xs text-gray-500 mb-1">{item.code}</p>
                  <p className="font-semibold text-gray-800 text-sm">{item.group}</p>
                  <p className={`text-2xl font-bold mt-2 ${isLow ? 'text-red-600' : 'text-indigo-600'}`}>
                    {item.stock}
                  </p>
                  <p className="text-xs text-gray-400">{item.unit}</p>
                  {isLow && <span className="text-xs text-red-500 font-medium mt-1 block">⚠ Low stock</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard