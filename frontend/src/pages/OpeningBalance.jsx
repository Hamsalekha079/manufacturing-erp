import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

import { api } from '../api'
import { Search } from 'lucide-react'

const paymentTypes = ['Cash', 'PhonePe', 'GPay', 'UPI', 'Cheque', 'Bank Transfer']

function SavedBadge({ saved }) {
  if (!saved) return null
  return <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✅ Saved</span>
}

function FieldRow({ label, children }) {
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      {children}
    </div>
  )
}

function AutoCalcField({ label, value, color = 'gray' }) {
  const colors = {
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
    gray: 'bg-gray-50 text-gray-600'
  }
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      <div className={`border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium ${colors[color]}`}>
        {value}
      </div>
    </div>
  )
}

const inputCls = () => 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

export default function OpeningBalance() {
  const { suppliers, castingCenters, customers, employees, reloadOpeningBalances } = useApp()
  
  const [activeTab, setActiveTab] = useState('finance')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [savedIds, setSavedIds] = useState({})
  const [saving, setSaving] = useState({})
  const [supplierForms, setSupplierForms] = useState({})
  const [castingForms, setCastingForms] = useState({})
  const [wasteForms, setWasteForms] = useState({})
  const [customerForms, setCustomerForms] = useState({})
  const [employeeForms, setEmployeeForms] = useState({})
  const [financeForm, setFinanceForm] = useState({ cashInHand: '', bankBalance: '', date: '', note: '' })

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getOpeningBalances()
        const sf = {}
        data.suppliers.forEach(ob => {
          sf[ob.supplierId] = { orderedKg: ob.orderedKg || '', receivedKg: ob.receivedKg || '', totalAmount: ob.totalAmount || '', paidAmount: ob.paidAmount || '', lastDate: ob.lastDate ? ob.lastDate.split('T')[0] : '', lastPaymentType: ob.lastPaymentType || '', note: ob.note || '' }
        })
        setSupplierForms(sf)
        const cf = {}, wf = {}
        data.casting.forEach(ob => {
          const form = { sentKg: ob.sentKg || '', returnedKg: ob.returnedKg || '', totalAmount: ob.totalAmount || '', paidAmount: ob.paidAmount || '', lastDate: ob.lastDate ? ob.lastDate.split('T')[0] : '', lastPaymentType: ob.lastPaymentType || '', note: ob.note || '' }
          if (ob.type === 'ROUND1') cf[ob.centerId] = form
          else wf[ob.centerId] = form
        })
        setCastingForms(cf)
        setWasteForms(wf)
        const custf = {}
        data.customers.forEach(ob => {
          custf[ob.customerId] = { totalBilled: ob.totalBilled || '', amountReceived: ob.amountReceived || '', lastDate: ob.lastDate ? ob.lastDate.split('T')[0] : '', lastPaymentType: ob.lastPaymentType || '', note: ob.note || '' }
        })
        setCustomerForms(custf)
        const empf = {}
        data.employees.forEach(ob => {
          empf[ob.employeeId] = { pendingSalary: ob.pendingSalary || '', pendingAdvance: ob.pendingAdvance || '', lastDate: ob.lastDate ? ob.lastDate.split('T')[0] : '', note: ob.note || '' }
        })
        setEmployeeForms(empf)
        if (data.finance) setFinanceForm({ cashInHand: data.finance.cashInHand || '', bankBalance: data.finance.bankBalance || '', date: data.finance.date ? data.finance.date.split('T')[0] : '', note: data.finance.note || '' })
        const saved = {}
        data.suppliers.forEach(ob => saved[`supplier-${ob.supplierId}`] = true)
        data.casting.forEach(ob => saved[`casting-${ob.centerId}-${ob.type}`] = true)
        data.customers.forEach(ob => saved[`customer-${ob.customerId}`] = true)
        data.employees.forEach(ob => saved[`employee-${ob.employeeId}`] = true)
        if (data.finance) saved['finance'] = true
        setSavedIds(saved)
      } catch (err) { console.error('Failed to load opening balances:', err) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  async function saveSupplier(supplierId) {
    const form = supplierForms[supplierId] || {}
    setSaving(p => ({ ...p, [`supplier-${supplierId}`]: true }))
    try { await api.saveSupplierOB({ supplierId, ...form }); setSavedIds(p => ({ ...p, [`supplier-${supplierId}`]: true })) 
    await reloadOpeningBalances()
  }
    catch (err) { console.error('Failed:', err) }
    setSaving(p => ({ ...p, [`supplier-${supplierId}`]: false }))
  }

  async function saveCasting(centerId, type) {
    const form = type === 'ROUND1' ? castingForms[centerId] : wasteForms[centerId]
    if (!form) return
    setSaving(p => ({ ...p, [`casting-${centerId}-${type}`]: true }))
    try { await api.saveCastingOB({ centerId, type, ...form }); setSavedIds(p => ({ ...p, [`casting-${centerId}-${type}`]: true })) 
    await reloadOpeningBalances()
  }
    catch (err) { console.error('Failed:', err) }
    setSaving(p => ({ ...p, [`casting-${centerId}-${type}`]: false }))
  }

  async function saveCustomer(customerId) {
    const form = customerForms[customerId] || {}
    setSaving(p => ({ ...p, [`customer-${customerId}`]: true }))
    try { await api.saveCustomerOB({ customerId, ...form }); setSavedIds(p => ({ ...p, [`customer-${customerId}`]: true }))
    await reloadOpeningBalances()
   }
    catch (err) { console.error('Failed:', err) }
    setSaving(p => ({ ...p, [`customer-${customerId}`]: false }))
  }

  async function saveEmployee(employeeId) {
    const form = employeeForms[employeeId] || {}
    setSaving(p => ({ ...p, [`employee-${employeeId}`]: true }))
    try { await api.saveEmployeeOB({ employeeId, ...form }); setSavedIds(p => ({ ...p, [`employee-${employeeId}`]: true })) 
    await reloadOpeningBalances()
  }
    catch (err) { console.error('Failed:', err) }
    setSaving(p => ({ ...p, [`employee-${employeeId}`]: false }))
  }

  async function saveFinance() {
    setSaving(p => ({ ...p, finance: true }))
    try { await api.saveFinanceOB(financeForm); setSavedIds(p => ({ ...p, finance: true })) 
    await reloadOpeningBalances()
  }
    catch (err) { console.error('Failed:', err) }
    setSaving(p => ({ ...p, finance: false }))
  }

  const tabs = [
    { id: 'finance', label: '💰 Finance' },
    { id: 'suppliers', label: `🏭 Suppliers (${suppliers.length})` },
    { id: 'casting', label: `🔥 Casting (${castingCenters.length})` },
    { id: 'customers', label: `🛒 Customers (${customers.length})` },
    { id: 'employees', label: `👷 Employees (${employees.length})` },
  ]

  const filteredSuppliers = suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
  const filteredCenters = castingCenters.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.location || '').toLowerCase().includes(search.toLowerCase()))
  const filteredEmployees = employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-gray-400">Loading...</p></div>

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Opening Balance</h2>
        <p className="text-gray-500 text-sm mt-1">Enter previous records — reflects in Materials, Sales, Employees & Finance</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-300 rounded-xl px-4 py-3">
        <p className="text-sm text-yellow-800">⚠ Enter opening balances only once. These will be included in all totals across all modules.</p>
      </div>

      {/* Tabs */}
      <div className="flex w-full gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setSearch('') }}
            className={`px-4 py-2 w-full text-sm font-medium border-b-2 transition whitespace-nowrap ${activeTab === t.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      {activeTab !== 'finance' && (
        <div className="relative max-w-sm">
          <input type="text" placeholder="Search..." className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={search} onChange={e => setSearch(e.target.value)} />
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      )}

      {/* FINANCE */}
      {activeTab === 'finance' && (
        <div className="bg-white rounded-xl shadow p-6 space-y-4 ">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Finance Opening Balance</h3>
            <SavedBadge saved={savedIds['finance']} />
          </div>
          <p className="text-xs text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full inline-block">Reflects in: Finance module totals</p>
          <div className="grid grid-cols-4 gap-4">
            <FieldRow label="Cash in Hand (₹)"><input type="number" className={inputCls()} value={financeForm.cashInHand} onChange={e => { setFinanceForm({ ...financeForm, cashInHand: e.target.value }); setSavedIds(p => ({ ...p, finance: false })) }} placeholder="0" /></FieldRow>
            <FieldRow label="Bank Balance (₹)"><input type="number" className={inputCls()} value={financeForm.bankBalance} onChange={e => { setFinanceForm({ ...financeForm, bankBalance: e.target.value }); setSavedIds(p => ({ ...p, finance: false })) }} placeholder="0" /></FieldRow>
            <FieldRow label="As of Date"><input type="date" className={inputCls()} value={financeForm.date} onChange={e => { setFinanceForm({ ...financeForm, date: e.target.value }); setSavedIds(p => ({ ...p, finance: false })) }} /></FieldRow>
            <FieldRow label="Note (optional)"><input className={inputCls()} value={financeForm.note} onChange={e => { setFinanceForm({ ...financeForm, note: e.target.value }); setSavedIds(p => ({ ...p, finance: false })) }} placeholder="Any note" /></FieldRow>
          </div>
          {(financeForm.cashInHand || financeForm.bankBalance) && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 flex justify-between">
              <span className="text-sm text-indigo-700">Total Opening Balance</span>
              <span className="font-bold text-indigo-700">₹{(parseFloat(financeForm.cashInHand || 0) + parseFloat(financeForm.bankBalance || 0)).toLocaleString()}</span>
            </div>
          )}
          <button onClick={saveFinance} disabled={saving['finance']} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
            {saving['finance'] ? 'Saving...' : 'Save Finance Balance'}
          </button>
        </div>
      )}

      {/* SUPPLIERS */}
      {activeTab === 'suppliers' && (
        <div className="space-y-3">
          {filteredSuppliers.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No suppliers found. Add suppliers in Materials module first.</p>}
          {filteredSuppliers.map(supplier => {
            const form = supplierForms[supplier.id] || {}
            const pendingKg = Math.max(0, parseFloat(form.orderedKg || 0) - parseFloat(form.receivedKg || 0))
            const balanceDue = Math.max(0, parseFloat(form.totalAmount || 0) - parseFloat(form.paidAmount || 0))
            const key = `supplier-${supplier.id}`
            return (
              <div key={supplier.id} className="bg-white rounded-xl shadow p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><span className="text-blue-600 font-bold text-sm">{supplier.name[0]}</span></div>
                    <div>
                      <p className="font-semibold text-gray-800">{supplier.name}</p>
                      <p className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block">Reflects in: Raw Material</p>
                    </div>
                  </div>
                  <SavedBadge saved={savedIds[key]} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <FieldRow label="Total Ordered (kg)"><input type="number" className={inputCls()} value={form.orderedKg || ''} onChange={e => { setSupplierForms(p => ({ ...p, [supplier.id]: { ...form, orderedKg: e.target.value } })); setSavedIds(p => ({ ...p, [key]: false })) }} placeholder="0" /></FieldRow>
                  <FieldRow label="Total Received (kg)"><input type="number" className={inputCls()} value={form.receivedKg || ''} onChange={e => { setSupplierForms(p => ({ ...p, [supplier.id]: { ...form, receivedKg: e.target.value } })); setSavedIds(p => ({ ...p, [key]: false })) }} placeholder="0" /></FieldRow>
                  <AutoCalcField label="Pending from them" value={`${pendingKg} kg`} color={pendingKg > 0 ? 'orange' : 'gray'} />
                  <FieldRow label="Total Amount (₹)"><input type="number" className={inputCls()} value={form.totalAmount || ''} onChange={e => { setSupplierForms(p => ({ ...p, [supplier.id]: { ...form, totalAmount: e.target.value } })); setSavedIds(p => ({ ...p, [key]: false })) }} placeholder="0" /></FieldRow>
                  <FieldRow label="Amount Paid (₹)"><input type="number" className={inputCls()} value={form.paidAmount || ''} onChange={e => { setSupplierForms(p => ({ ...p, [supplier.id]: { ...form, paidAmount: e.target.value } })); setSavedIds(p => ({ ...p, [key]: false })) }} placeholder="0" /></FieldRow>
                  <AutoCalcField label="Balance I Owe (₹)" value={`₹${balanceDue.toLocaleString()}`} color={balanceDue > 0 ? 'red' : 'green'} />
                  <FieldRow label="Last Date"><input type="date" className={inputCls()} value={form.lastDate || ''} onChange={e => { setSupplierForms(p => ({ ...p, [supplier.id]: { ...form, lastDate: e.target.value } })); setSavedIds(p => ({ ...p, [key]: false })) }} /></FieldRow>
                  <FieldRow label="Last Payment Type"><select className={inputCls()} value={form.lastPaymentType || ''} onChange={e => { setSupplierForms(p => ({ ...p, [supplier.id]: { ...form, lastPaymentType: e.target.value } })); setSavedIds(p => ({ ...p, [key]: false })) }}><option value="">Select</option>{paymentTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></FieldRow>
                </div>
                <button onClick={() => saveSupplier(supplier.id)} disabled={saving[key]} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                  {saving[key] ? 'Saving...' : `Save ${supplier.name}`}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* CASTING */}
      {activeTab === 'casting' && (
        <div className="space-y-3">
          {filteredCenters.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No casting centers found. Add centers in Materials module first.</p>}
          {filteredCenters.map(center => {
            const cf = castingForms[center.id] || {}
            const wf = wasteForms[center.id] || {}
            const cPending = Math.max(0, parseFloat(cf.sentKg || 0) - parseFloat(cf.returnedKg || 0))
            const cDue = Math.max(0, parseFloat(cf.totalAmount || 0) - parseFloat(cf.paidAmount || 0))
            const wPending = Math.max(0, parseFloat(wf.sentKg || 0) - parseFloat(wf.returnedKg || 0))
            const wDue = Math.max(0, parseFloat(wf.totalAmount || 0) - parseFloat(wf.paidAmount || 0))
            return (
              <div key={center.id} className="bg-white rounded-xl shadow p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0"><span className="text-purple-600 font-bold text-sm">{center.name[0]}</span></div>
                  <div>
                    <p className="font-semibold text-gray-800">{center.name}</p>
                    <p className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full inline-block">Reflects in: Casting & Waste tabs</p>
                  </div>
                </div>
                {/* Round 1 */}
                <div className="border border-purple-100 rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-purple-700">Round 1 — Casting</p>
                    <SavedBadge saved={savedIds[`casting-${center.id}-ROUND1`]} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <FieldRow label="Sent (kg)"><input type="number" className={inputCls()} value={cf.sentKg || ''} onChange={e => { setCastingForms(p => ({ ...p, [center.id]: { ...cf, sentKg: e.target.value } })); setSavedIds(p => ({ ...p, [`casting-${center.id}-ROUND1`]: false })) }} placeholder="0" /></FieldRow>
                    <FieldRow label="Returned (kg)"><input type="number" className={inputCls()} value={cf.returnedKg || ''} onChange={e => { setCastingForms(p => ({ ...p, [center.id]: { ...cf, returnedKg: e.target.value } })); setSavedIds(p => ({ ...p, [`casting-${center.id}-ROUND1`]: false })) }} placeholder="0" /></FieldRow>
                    <AutoCalcField label="Pending with them" value={`${cPending} kg`} color={cPending > 0 ? 'orange' : 'gray'} />
                    <FieldRow label="Total Charges (₹)"><input type="number" className={inputCls()} value={cf.totalAmount || ''} onChange={e => { setCastingForms(p => ({ ...p, [center.id]: { ...cf, totalAmount: e.target.value } })); setSavedIds(p => ({ ...p, [`casting-${center.id}-ROUND1`]: false })) }} placeholder="0" /></FieldRow>
                    <FieldRow label="Amount Paid (₹)"><input type="number" className={inputCls()} value={cf.paidAmount || ''} onChange={e => { setCastingForms(p => ({ ...p, [center.id]: { ...cf, paidAmount: e.target.value } })); setSavedIds(p => ({ ...p, [`casting-${center.id}-ROUND1`]: false })) }} placeholder="0" /></FieldRow>
                    <AutoCalcField label="Balance I Owe (₹)" value={`₹${cDue.toLocaleString()}`} color={cDue > 0 ? 'red' : 'green'} />
                    <FieldRow label="Last Date"><input type="date" className={inputCls()} value={cf.lastDate || ''} onChange={e => { setCastingForms(p => ({ ...p, [center.id]: { ...cf, lastDate: e.target.value } })); setSavedIds(p => ({ ...p, [`casting-${center.id}-ROUND1`]: false })) }} /></FieldRow>
                    <FieldRow label="Last Payment Type"><select className={inputCls()} value={cf.lastPaymentType || ''} onChange={e => { setCastingForms(p => ({ ...p, [center.id]: { ...cf, lastPaymentType: e.target.value } })); setSavedIds(p => ({ ...p, [`casting-${center.id}-ROUND1`]: false })) }}><option value="">Select</option>{paymentTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></FieldRow>
                  </div>
                  <button onClick={() => saveCasting(center.id, 'ROUND1')} disabled={saving[`casting-${center.id}-ROUND1`]} className="bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50">
                    {saving[`casting-${center.id}-ROUND1`] ? 'Saving...' : 'Save Round 1'}
                  </button>
                </div>
                {/* Waste */}
                <div className="border border-amber-100 rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-amber-700">Waste & Casting</p>
                    <SavedBadge saved={savedIds[`casting-${center.id}-ROUND2_WASTE`]} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <FieldRow label="Waste Sent (kg)"><input type="number" className={inputCls()} value={wf.sentKg || ''} onChange={e => { setWasteForms(p => ({ ...p, [center.id]: { ...wf, sentKg: e.target.value } })); setSavedIds(p => ({ ...p, [`casting-${center.id}-ROUND2_WASTE`]: false })) }} placeholder="0" /></FieldRow>
                    <FieldRow label="Returned (kg)"><input type="number" className={inputCls()} value={wf.returnedKg || ''} onChange={e => { setWasteForms(p => ({ ...p, [center.id]: { ...wf, returnedKg: e.target.value } })); setSavedIds(p => ({ ...p, [`casting-${center.id}-ROUND2_WASTE`]: false })) }} placeholder="0" /></FieldRow>
                    <AutoCalcField label="Pending with them" value={`${wPending} kg`} color={wPending > 0 ? 'orange' : 'gray'} />
                    <FieldRow label="Total Charges (₹)"><input type="number" className={inputCls()} value={wf.totalAmount || ''} onChange={e => { setWasteForms(p => ({ ...p, [center.id]: { ...wf, totalAmount: e.target.value } })); setSavedIds(p => ({ ...p, [`casting-${center.id}-ROUND2_WASTE`]: false })) }} placeholder="0" /></FieldRow>
                    <FieldRow label="Amount Paid (₹)"><input type="number" className={inputCls()} value={wf.paidAmount || ''} onChange={e => { setWasteForms(p => ({ ...p, [center.id]: { ...wf, paidAmount: e.target.value } })); setSavedIds(p => ({ ...p, [`casting-${center.id}-ROUND2_WASTE`]: false })) }} placeholder="0" /></FieldRow>
                    <AutoCalcField label="Balance I Owe (₹)" value={`₹${wDue.toLocaleString()}`} color={wDue > 0 ? 'red' : 'green'} />
                    <FieldRow label="Last Date"><input type="date" className={inputCls()} value={wf.lastDate || ''} onChange={e => { setWasteForms(p => ({ ...p, [center.id]: { ...wf, lastDate: e.target.value } })); setSavedIds(p => ({ ...p, [`casting-${center.id}-ROUND2_WASTE`]: false })) }} /></FieldRow>
                    <FieldRow label="Last Payment Type"><select className={inputCls()} value={wf.lastPaymentType || ''} onChange={e => { setWasteForms(p => ({ ...p, [center.id]: { ...wf, lastPaymentType: e.target.value } })); setSavedIds(p => ({ ...p, [`casting-${center.id}-ROUND2_WASTE`]: false })) }}><option value="">Select</option>{paymentTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></FieldRow>
                  </div>
                  <button onClick={() => saveCasting(center.id, 'ROUND2_WASTE')} disabled={saving[`casting-${center.id}-ROUND2_WASTE`]} className="bg-amber-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-amber-700 disabled:opacity-50">
                    {saving[`casting-${center.id}-ROUND2_WASTE`] ? 'Saving...' : 'Save Waste & Casting'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="space-y-3">
          {filteredCustomers.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No customers found. Add customers in Sales module first.</p>}
          {filteredCustomers.map(customer => {
            const form = customerForms[customer.id] || {}
            const balanceDue = Math.max(0, parseFloat(form.totalBilled || 0) - parseFloat(form.amountReceived || 0))
            const key = `customer-${customer.id}`
            return (
              <div key={customer.id} className="bg-white rounded-xl shadow p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0"><span className="text-green-600 font-bold text-sm">{customer.name[0]}</span></div>
                    <div>
                      <p className="font-semibold text-gray-800">{customer.name}</p>
                      <p className="text-xs text-gray-400">{customer.location} · {customer.phone}</p>
                      <p className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-block mt-0.5">Reflects in: Sales module</p>
                    </div>
                  </div>
                  <SavedBadge saved={savedIds[key]} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <FieldRow label="Total Billed (₹)"><input type="number" className={inputCls()} value={form.totalBilled || ''} onChange={e => { setCustomerForms(p => ({ ...p, [customer.id]: { ...form, totalBilled: e.target.value } })); setSavedIds(p => ({ ...p, [key]: false })) }} placeholder="0" /></FieldRow>
                  <FieldRow label="Amount Received (₹)"><input type="number" className={inputCls()} value={form.amountReceived || ''} onChange={e => { setCustomerForms(p => ({ ...p, [customer.id]: { ...form, amountReceived: e.target.value } })); setSavedIds(p => ({ ...p, [key]: false })) }} placeholder="0" /></FieldRow>
                  <AutoCalcField label="Balance to Collect (₹)" value={`₹${balanceDue.toLocaleString()}`} color={balanceDue > 0 ? 'red' : 'green'} />
                  <FieldRow label="Last Transaction Date"><input type="date" className={inputCls()} value={form.lastDate || ''} onChange={e => { setCustomerForms(p => ({ ...p, [customer.id]: { ...form, lastDate: e.target.value } })); setSavedIds(p => ({ ...p, [key]: false })) }} /></FieldRow>
                  <FieldRow label="Last Payment Type"><select className={inputCls()} value={form.lastPaymentType || ''} onChange={e => { setCustomerForms(p => ({ ...p, [customer.id]: { ...form, lastPaymentType: e.target.value } })); setSavedIds(p => ({ ...p, [key]: false })) }}><option value="">Select</option>{paymentTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></FieldRow>
                  <FieldRow label="Note (optional)"><input className={inputCls()} value={form.note || ''} onChange={e => { setCustomerForms(p => ({ ...p, [customer.id]: { ...form, note: e.target.value } })); setSavedIds(p => ({ ...p, [key]: false })) }} placeholder="Optional" /></FieldRow>
                </div>
                <button onClick={() => saveCustomer(customer.id)} disabled={saving[key]} className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                  {saving[key] ? 'Saving...' : `Save ${customer.name}`}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* EMPLOYEES */}
      {activeTab === 'employees' && (
        <div className="space-y-3">
          {filteredEmployees.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No employees found.</p>}
          {filteredEmployees.map(emp => {
            const form = employeeForms[emp.id] || {}
            const key = `employee-${emp.id}`
            return (
              <div key={emp.id} className="bg-white rounded-xl shadow p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0"><span className="text-orange-600 font-bold text-sm">{emp.name[0]}</span></div>
                    <div>
                      <p className="font-semibold text-gray-800">{emp.name}</p>
                      <p className="text-xs text-gray-400">{emp.role} · {emp.salaryType}</p>
                      <p className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full inline-block mt-0.5">Reflects in: Employees module</p>
                    </div>
                  </div>
                  <SavedBadge saved={savedIds[key]} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <FieldRow label="Pending Salary (₹)"><input type="number" className={inputCls()} value={form.pendingSalary || ''} onChange={e => { setEmployeeForms(p => ({ ...p, [emp.id]: { ...form, pendingSalary: e.target.value } })); setSavedIds(p => ({ ...p, [key]: false })) }} placeholder="0" /></FieldRow>
                  <FieldRow label="Pending Advance (₹)"><input type="number" className={inputCls()} value={form.pendingAdvance || ''} onChange={e => { setEmployeeForms(p => ({ ...p, [emp.id]: { ...form, pendingAdvance: e.target.value } })); setSavedIds(p => ({ ...p, [key]: false })) }} placeholder="0" /></FieldRow>
                  <FieldRow label="Last Salary Date"><input type="date" className={inputCls()} value={form.lastDate || ''} onChange={e => { setEmployeeForms(p => ({ ...p, [emp.id]: { ...form, lastDate: e.target.value } })); setSavedIds(p => ({ ...p, [key]: false })) }} /></FieldRow>
                  <FieldRow label="Note (optional)"><input className={inputCls()} value={form.note || ''} onChange={e => { setEmployeeForms(p => ({ ...p, [emp.id]: { ...form, note: e.target.value } })); setSavedIds(p => ({ ...p, [key]: false })) }} placeholder="Optional" /></FieldRow>
                </div>
                <button onClick={() => saveEmployee(emp.id)} disabled={saving[key]} className="bg-orange-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-orange-700 disabled:opacity-50">
                  {saving[key] ? 'Saving...' : `Save ${emp.name}`}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}