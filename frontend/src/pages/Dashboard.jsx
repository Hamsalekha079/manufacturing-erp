import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── DUMMY DATA ─────────────────────────────────────────
const weeklyData = {
  invest: {
    rawMaterial: 102500,
    casting: 14170,
    wasteCasting: 970,
    salaries: 43600,
    transport: 4500,
  },
  collection: {
    total: 97500,
    received: 40500,
    pending: 57000,
    overdue: 32000,
  }
}

const monthlyData = {
  invest: {
    rawMaterial: 380000,
    casting: 52000,
    wasteCasting: 4200,
    salaries: 174400,
    transport: 18000,
  },
  collection: {
    total: 390000,
    received: 162000,
    pending: 228000,
    overdue: 89000,
  }
}

const stockGroups = [
  { group: 'Kalash - Standard', code: 'Sd', stock: 120, unit: 'pcs', low: 20 },
  { group: 'Kalash - Light Weight', code: 'LW', stock: 15, unit: 'pcs', low: 20 },
  { group: 'Kalash - Asta Lakshmi', code: 'AL', stock: 40, unit: 'pcs', low: 15 },
  { group: 'Panchapatra', code: 'BPP', stock: 60, unit: 'pcs', low: 10 },
  { group: 'Glass', code: 'GL', stock: 8, unit: 'pcs', low: 10 },
  { group: 'Plate', code: 'BPL', stock: 75, unit: 'pcs', low: 15 },
  { group: 'Spoon', code: 'Ud', stock: 24, unit: 'dozen', low: 5 },
  { group: 'Kubera Kuncham', code: 'KK', stock: 45, unit: 'pcs', low: 10 },
]

// ─── COMPONENTS ─────────────────────────────────────────
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
  const [period, setPeriod] = useState('weekly')
  const data = period === 'weekly' ? weeklyData : monthlyData

  const totalInvest = Object.values(data.invest).reduce((s, v) => s + v, 0)
  const profit = data.collection.received - totalInvest

  return (
    <div className="space-y-6">
      {/* Header + Period Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">Business overview at a glance</p>
        </div>
        <div className="flex gap-2">
          {['weekly', 'monthly'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                period === p
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Top Summary Row */}
      <div className="grid grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/finance')}
          className="bg-white rounded-xl shadow p-5 cursor-pointer hover:shadow-md transition border-l-4 border-red-400"
        >
          <p className="text-sm text-gray-500">Total Invest</p>
          <p className="text-2xl font-bold text-red-500 mt-1">₹{totalInvest.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Click to see breakdown →</p>
        </div>
        <div
          onClick={() => navigate('/sales')}
          className="bg-white rounded-xl shadow p-5 cursor-pointer hover:shadow-md transition border-l-4 border-green-400"
        >
          <p className="text-sm text-gray-500">Total Collection</p>
          <p className="text-2xl font-bold text-green-600 mt-1">₹{data.collection.received.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Click to see details →</p>
        </div>
        <div className={`rounded-xl shadow p-5 border-l-4 ${profit >= 0 ? 'bg-indigo-50 border-indigo-400' : 'bg-red-50 border-red-400'}`}>
          <p className="text-sm text-gray-500">Net Profit</p>
          <p className={`text-2xl font-bold mt-1 ${profit >= 0 ? 'text-indigo-600' : 'text-red-500'}`}>
            ₹{Math.abs(profit).toLocaleString()}
            <span className="text-sm font-normal ml-1">{profit >= 0 ? 'profit' : 'loss'}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">{period === 'weekly' ? 'This week' : 'This month'}</p>
        </div>
      </div>

      {/* Invest + Collection Side by Side */}
      <div className="grid grid-cols-2 gap-6">
        {/* INVEST BREAKDOWN */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Invest Breakdown</h3>
            <button
              onClick={() => navigate('/finance')}
              className="text-indigo-600 text-sm hover:underline"
            >
              View all →
            </button>
          </div>
          <div className="space-y-2">
            <InvestCard
              label="Raw Material"
              amount={data.invest.rawMaterial}
              color="bg-blue-50 border-blue-200"
              onClick={() => navigate('/materials')}
            />
            <InvestCard
              label="Casting Charges (Round 1)"
              amount={data.invest.casting}
              color="bg-purple-50 border-purple-200"
              onClick={() => navigate('/materials')}
            />
            <InvestCard
              label="Casting Charges (Waste)"
              amount={data.invest.wasteCasting}
              color="bg-pink-50 border-pink-200"
              onClick={() => navigate('/materials')}
            />
            <InvestCard
              label="Salaries"
              amount={data.invest.salaries}
              color="bg-orange-50 border-orange-200"
              onClick={() => navigate('/employees')}
            />
            <InvestCard
              label="Transport"
              amount={data.invest.transport}
              color="bg-yellow-50 border-yellow-200"
              onClick={() => navigate('/sales')}
            />
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800 mt-2">
              <p className="text-sm font-medium text-gray-200">Total Invest</p>
              <p className="font-bold text-white">₹{totalInvest.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* COLLECTION BREAKDOWN */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Collection Breakdown</h3>
            <button
              onClick={() => navigate('/sales')}
              className="text-indigo-600 text-sm hover:underline"
            >
              View all →
            </button>
          </div>
          <div className="space-y-2">
            <div
              onClick={() => navigate('/sales')}
              className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-200 cursor-pointer hover:shadow transition"
            >
              <p className="text-sm font-medium text-gray-700">Total Billed</p>
              <p className="font-bold text-gray-800">₹{data.collection.total.toLocaleString()}</p>
            </div>
            <div
              onClick={() => navigate('/sales')}
              className="flex items-center justify-between p-4 rounded-lg bg-blue-50 border border-blue-200 cursor-pointer hover:shadow transition"
            >
              <p className="text-sm font-medium text-gray-700">Received</p>
              <p className="font-bold text-green-600">₹{data.collection.received.toLocaleString()}</p>
            </div>
            <div
              onClick={() => navigate('/sales')}
              className="flex items-center justify-between p-4 rounded-lg bg-yellow-50 border border-yellow-200 cursor-pointer hover:shadow transition"
            >
              <p className="text-sm font-medium text-gray-700">Pending</p>
              <p className="font-bold text-yellow-600">₹{data.collection.pending.toLocaleString()}</p>
            </div>
            <div
              onClick={() => navigate('/sales')}
              className="flex items-center justify-between p-4 rounded-lg bg-red-50 border border-red-200 cursor-pointer hover:shadow transition"
            >
              <p className="text-sm font-medium text-gray-700">Overdue</p>
              <p className="font-bold text-red-600">₹{data.collection.overdue.toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800 mt-2">
              <p className="text-sm font-medium text-gray-200">Balance to Collect</p>
              <p className="font-bold text-white">₹{data.collection.pending.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Overview */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Stock Overview</h3>
          <button
            onClick={() => navigate('/stock')}
            className="text-indigo-600 text-sm hover:underline"
          >
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
    </div>
  )
}

export default Dashboard