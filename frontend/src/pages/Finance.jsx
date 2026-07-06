import { useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Modal from '../components/Modal'
import { useApp } from '../context/AppContext'

const incomeCategories = ['Sale', 'Advance', 'Other']
const expenseCategories = ['Material', 'Casting', 'Salary', 'Transport', 'Other']

function Finance() {
  const [activeTab, setActiveTab] = useState('overview')
  const [chartType, setChartType] = useState('weekly')
  const { income: incomeList, expenses: expenseList, addIncome, addExpense } = useApp()
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [incomeForm, setIncomeForm] = useState({ category: 'Sale', description: '', amount: '', date: '' })
  const [expenseForm, setExpenseForm] = useState({ category: 'Material', description: '', amount: '', date: '' })

  function buildChartData(period) {
    const groups = {}
    const allEntries = [
      ...incomeList.map(i => ({ ...i, type: 'income' })),
      ...expenseList.map(e => ({ ...e, type: 'expense' }))
    ]
    for (const entry of allEntries) {
      const date = new Date(entry.date)
      let key
      if (period === 'weekly') {
        const weekNum = Math.ceil(date.getDate() / 7)
        key = `${date.toLocaleString('default', { month: 'short' })} W${weekNum}`
      } else {
        key = date.toLocaleString('default', { month: 'short', year: '2-digit' })
      }
      if (!groups[key]) groups[key] = { income: 0, expense: 0, sortDate: date }
      if (entry.type === 'income') groups[key].income += entry.amount
      else groups[key].expense += entry.amount
    }
    return Object.entries(groups)
      .sort((a, b) => a[1].sortDate - b[1].sortDate)
      .map(([key, val]) => ({
        [period === 'weekly' ? 'week' : 'month']: key,
        income: val.income,
        expense: val.expense,
        profit: val.income - val.expense
      }))
  }

  const chartData = buildChartData(chartType)
  const xKey = chartType === 'weekly' ? 'week' : 'month'

  const totalIncome = incomeList.reduce((s, i) => s + i.amount, 0)
  const totalExpense = expenseList.reduce((s, e) => s + e.amount, 0)
  const totalProfit = totalIncome - totalExpense
 function handleAddIncome() {
  if (!incomeForm.description || !incomeForm.amount) return
  addIncome({
    category: incomeForm.category,
    description: incomeForm.description,
    amount: parseFloat(incomeForm.amount),
    date: incomeForm.date || new Date().toISOString().split('T')[0]
  })
  setIncomeForm({ category: 'Sale', description: '', amount: '', date: '' })
  setShowIncomeModal(false)
}

function handleAddExpense() {
  if (!expenseForm.description || !expenseForm.amount) return
  addExpense({
    category: expenseForm.category,
    description: expenseForm.description,
    amount: parseFloat(expenseForm.amount),
    date: expenseForm.date || new Date().toISOString().split('T')[0]
  })
  setExpenseForm({ category: 'Material', description: '', amount: '', date: '' })
  setShowExpenseModal(false)
}

  const categoryColors = {
    Material: 'bg-blue-100 text-blue-600',
    Casting: 'bg-purple-100 text-purple-600',
    Salary: 'bg-orange-100 text-orange-600',
    Transport: 'bg-yellow-100 text-yellow-600',
    Sale: 'bg-green-100 text-green-600',
    Advance: 'bg-teal-100 text-teal-600',
    Other: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Finance</h2>
          <p className="text-gray-500 text-sm mt-1">Track investment, revenue and profit</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowIncomeModal(true)}
            className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
          >
            + Add Income
          </button>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex-1 sm:flex-none bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
          >
            + Add Expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Total Income</p>
          <p className="text-2xl font-bold text-green-600 mt-1">₹{totalIncome.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">This month</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Total Expense</p>
          <p className="text-2xl font-bold text-red-500 mt-1">₹{totalExpense.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">This month</p>
        </div>
        <div className={`rounded-xl shadow p-5 ${totalProfit >= 0 ? 'bg-indigo-600' : 'bg-red-600'}`}>
          <p className="text-sm text-indigo-200">Net Profit</p>
          <p className="text-2xl font-bold text-white mt-1">₹{Math.abs(totalProfit).toLocaleString()}</p>
          <p className="text-xs text-indigo-200 mt-1">{totalProfit >= 0 ? 'Profit' : 'Loss'} this month</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {['overview', 'income', 'expenses'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'income' ? `Income (${incomeList.length})` : tab === 'expenses' ? `Expenses (${expenseList.length})` : 'Overview'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <h3 className="font-semibold text-gray-800">Income vs Expense vs Profit</h3>
              <div className="flex gap-2">
                {['weekly', 'monthly'].map(t => (
                  <button
                    key={t}
                    onClick={() => setChartType(t)}
                    className={`px-3 py-1 rounded-lg text-sm capitalize ${
                      chartType === t
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="-mx-4 sm:mx-0">
              <ResponsiveContainer width="100%" height={280} className="sm:!h-[300px]">
                <BarChart data={chartData} margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={40} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="income" fill="#16a34a" name="Income" radius={[4,4,0,0]} />
                  <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4,4,0,0]} />
                  <Bar dataKey="profit" fill="#4f46e5" name="Profit" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 sm:p-6">
            <h3 className="font-semibold text-gray-800 mb-6">Profit Trend</h3>
            <div className="-mx-4 sm:mx-0">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={buildChartData('monthly')} margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={40} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
                  <Line type="monotone" dataKey="profit" stroke="#4f46e5" strokeWidth={2} dot={{ fill: '#4f46e5' }} name="Profit" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expense breakdown by category */}
          <div className="bg-white rounded-xl shadow p-4 sm:p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Expense Breakdown</h3>
            <div className="space-y-3">
              {expenseCategories.map(cat => {
                const total = expenseList.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0)
                const percent = totalExpense > 0 ? ((total / totalExpense) * 100).toFixed(1) : 0
                if (total === 0) return null
                return (
                  <div key={cat}>
                    <div className="flex flex-wrap justify-between text-sm mb-1 gap-x-2">
                      <span className="text-gray-700 font-medium">{cat}</span>
                      <span className="text-gray-800 font-bold">₹{total.toLocaleString()} <span className="text-gray-400 font-normal">({percent}%)</span></span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Income Tab */}
      {activeTab === 'income' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h3 className="font-semibold text-gray-800">Income Entries</h3>
            <button
              onClick={() => setShowIncomeModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
            >
              + Add Income
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs text-gray-400 uppercase">
                  <th className="px-4 sm:px-5 py-3">Description</th>
                  <th className="px-4 sm:px-5 py-3">Category</th>
                  <th className="px-4 sm:px-5 py-3">Amount</th>
                  <th className="px-4 sm:px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {incomeList.map(i => (
                  <tr key={i.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-5 py-3 text-sm text-gray-800">{i.description}</td>
                    <td className="px-4 sm:px-5 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColors[i.category]}`}>
                        {i.category}
                      </span>
                    </td>
                    <td className="px-4 sm:px-5 py-3 text-sm font-bold text-green-600">₹{i.amount.toLocaleString()}</td>
                    <td className="px-4 sm:px-5 py-3 text-sm text-gray-400">{i.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h3 className="font-semibold text-gray-800">Expense Entries</h3>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
            >
              + Add Expense
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs text-gray-400 uppercase">
                  <th className="px-4 sm:px-5 py-3">Description</th>
                  <th className="px-4 sm:px-5 py-3">Category</th>
                  <th className="px-4 sm:px-5 py-3">Amount</th>
                  <th className="px-4 sm:px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenseList.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-5 py-3 text-sm text-gray-800">{e.description}</td>
                    <td className="px-4 sm:px-5 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColors[e.category]}`}>
                        {e.category}
                      </span>
                    </td>
                    <td className="px-4 sm:px-5 py-3 text-sm font-bold text-red-500">₹{e.amount.toLocaleString()}</td>
                    <td className="px-4 sm:px-5 py-3 text-sm text-gray-400">{e.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ADD INCOME MODAL ── */}
      {showIncomeModal && (
        <Modal title="Add Income" onClose={() => setShowIncomeModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
              <div className="flex gap-2 flex-wrap">
                {incomeCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setIncomeForm({ ...incomeForm, category: cat })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                      incomeForm.category === cat
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={incomeForm.description}
                onChange={e => setIncomeForm({ ...incomeForm, description: e.target.value })}
                placeholder="e.g. Payment from Sri Lakshmi Stores"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={incomeForm.amount}
                  onChange={e => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={incomeForm.date}
                  onChange={e => setIncomeForm({ ...incomeForm, date: e.target.value })}
                />
              </div>
            </div>
            {incomeForm.amount && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex flex-wrap justify-between gap-2">
                <span className="text-sm text-green-700">{incomeForm.category} — {incomeForm.description || 'Income'}</span>
                <span className="font-bold text-green-700">+₹{parseFloat(incomeForm.amount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddIncome}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700"
              >
                Add Income
              </button>
              <button
                onClick={() => setShowIncomeModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── ADD EXPENSE MODAL ── */}
      {showExpenseModal && (
        <Modal title="Add Expense" onClose={() => setShowExpenseModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
              <div className="flex gap-2 flex-wrap">
                {expenseCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setExpenseForm({ ...expenseForm, category: cat })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                      expenseForm.category === cat
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={expenseForm.description}
                onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                placeholder="e.g. Copper purchase from Ravi Kumar"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={expenseForm.amount}
                  onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={expenseForm.date}
                  onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                />
              </div>
            </div>
            {expenseForm.amount && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex flex-wrap justify-between gap-2">
                <span className="text-sm text-red-700">{expenseForm.category} — {expenseForm.description || 'Expense'}</span>
                <span className="font-bold text-red-700">-₹{parseFloat(expenseForm.amount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddExpense}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600"
              >
                Add Expense
              </button>
              <button
                onClick={() => setShowExpenseModal(false)}
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

export default Finance