import { useState } from 'react'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import Modal from '../components/Modal'
import { useApp } from '../context/AppContext'

const paymentMethods = ['Cash', 'PhonePe', 'GPay', 'Bank Transfer']
const today = new Date()

function getOrderStatus(order) {
  const paid = order.payments.reduce((s, p) => s + p.amount, 0)
  const balance = order.totalAmount - paid
  if (balance <= 0) return 'paid'
  if (order.deliveryStatus === 'pending') return 'pending_delivery'
  if (new Date(order.dueDate) < today) return 'overdue'
  return 'pending_payment'
}

function methodBadge(method) {
  const colors = {
    Cash: 'bg-green-100 text-green-700',
    PhonePe: 'bg-purple-100 text-purple-700',
    GPay: 'bg-blue-100 text-blue-700',
    'Bank Transfer': 'bg-gray-100 text-gray-700',
  }
  return colors[method] || 'bg-gray-100 text-gray-700'
}

// ─── ORDER CARD ──────────────────────────────────────────
function OrderCard({ order, customerId }) {
  const { markDelivered, recordPayment, checkStockWarnings } = useApp()
  const [open, setOpen] = useState(false)
  const [showPayModal, setShowPayModal] = useState(false)
  const [payForm, setPayForm] = useState({ amount: '', method: 'Cash' })
  const [stockWarnings, setStockWarnings] = useState([])
  const [search,setSearch] = useState('')

  const paid = order.payments.reduce((s, p) => s + p.amount, 0)
  const balance = order.totalAmount - paid
  const status = getOrderStatus(order)
  const daysLeft = order.dueDate
    ? Math.ceil((new Date(order.dueDate) - today) / (1000 * 60 * 60 * 24))
    : null

  const statusStyle = {
    paid: 'border-green-300 bg-green-50',
    overdue: 'border-red-300 bg-red-50',
    pending_payment: 'border-yellow-300 bg-yellow-50',
    pending_delivery: 'border-blue-300 bg-blue-50',
  }

  const statusBadge = {
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    pending_payment: 'bg-yellow-100 text-yellow-700',
    pending_delivery: 'bg-blue-100 text-blue-700',
  }

  const statusLabel = {
    paid: '✅ Paid',
    overdue: '⚠ Overdue',
    pending_payment: '⏳ Payment Pending',
    pending_delivery: '🚚 Pending Delivery',
  }

  function handleMarkDelivered() {
    const warnings = checkStockWarnings(order.items)
    setStockWarnings(warnings)
    markDelivered(customerId, order.id)
  }

  function handleRecordPayment() {
    if (!payForm.amount) return
    recordPayment(customerId, order.id, parseFloat(payForm.amount), payForm.method)
    setPayForm({ amount: '', method: 'Cash' })
    setShowPayModal(false)
  }

  return (
    <div className={`border rounded-xl overflow-hidden ${statusStyle[status]}`}>
      {/* Order Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div>
          <p className="text-sm font-semibold text-gray-800">Order — {order.date}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {order.items.length} items · Due: {order.dueDate}
            {status === 'pending_payment' && daysLeft > 0 && (
              <span className="text-yellow-600 ml-1">({daysLeft}d left)</span>
            )}
            {status === 'overdue' && (
              <span className="text-red-600 ml-1">({Math.abs(daysLeft)}d overdue)</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-400">Total / Paid / Balance</p>
            <p className="text-sm font-bold">
              ₹{order.totalAmount.toLocaleString()} /
              <span className="text-green-600"> ₹{paid.toLocaleString()}</span> /
              <span className="text-red-500"> ₹{balance.toLocaleString()}</span>
            </p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge[status]}`}>
            {statusLabel[status]}
          </span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded */}
      {open && (
        <div className="border-t border-gray-200 bg-white p-4 space-y-4">

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            {order.deliveryStatus === 'pending' && (
              <button
                onClick={handleMarkDelivered}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700"
              >
                🚚 Mark as Delivered
              </button>
            )}
            {order.deliveryStatus === 'delivered' && balance > 0 && (
              <button
                onClick={() => setShowPayModal(true)}
                className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700"
              >
                💰 Record Payment
              </button>
            )}
            {order.deliveryStatus === 'delivered' && (
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-medium">
                ✅ Delivered
              </span>
            )}
          </div>

          {/* Stock warnings */}
          {stockWarnings.length > 0 && (
            <div className="space-y-1">
              {stockWarnings.map((w, i) => (
                <div key={i} className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  w.type === 'error'
                    ? 'bg-red-50 border border-red-200 text-red-700'
                    : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                }`}>
                  <span>{w.type === 'error' ? '❌' : '⚠️'}</span>
                  <span>{w.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Items</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400">
                  <th className="pb-1">Code</th>
                  <th className="pb-1">Product</th>
                  <th className="pb-1">Qty</th>
                  <th className="pb-1">Price</th>
                  <th className="pb-1">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-1.5 font-mono text-xs text-gray-500">{item.code}</td>
                    <td className="py-1.5 text-gray-800">{item.name}</td>
                    <td className="py-1.5 text-gray-600">× {item.qty}</td>
                    <td className="py-1.5 text-gray-600">₹{item.price}</td>
                    <td className="py-1.5 font-bold text-gray-800">
                      ₹{(item.qty * item.price).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment history */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Payment History</p>
            {order.payments.length === 0 ? (
              <p className="text-sm text-gray-400">No payments yet</p>
            ) : (
              <div className="space-y-1">
                {order.payments.map((p, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${methodBadge(p.method)}`}>
                        {p.method}
                      </span>
                      <span className="text-sm text-gray-600">{p.date}</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">
                      ₹{p.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                {balance > 0 && (
                  <div className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                    <span className="text-sm text-red-600 font-medium">Balance</span>
                    <span className="text-sm font-bold text-red-600">₹{balance.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPayModal && (
        <Modal title="Record Payment" onClose={() => setShowPayModal(false)}>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg px-4 py-3 flex justify-between">
              <span className="text-sm text-gray-600">Balance due</span>
              <span className="font-bold text-red-600">₹{balance.toLocaleString()}</span>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Amount Received (₹)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={payForm.amount}
                onChange={e => setPayForm({ ...payForm, amount: e.target.value })}
                placeholder={`Max: ₹${balance.toLocaleString()}`}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Payment Method</label>
              <div className="flex gap-2 flex-wrap">
                {paymentMethods.map(m => (
                  <button
                    key={m}
                    onClick={() => setPayForm({ ...payForm, method: m })}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                      payForm.method === m
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            {payForm.amount && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex justify-between">
                <span className="text-sm text-green-700">Recording</span>
                <span className="font-bold text-green-700">
                  ₹{parseFloat(payForm.amount).toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleRecordPayment}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700"
              >
                Record Payment
              </button>
              <button
                onClick={() => setShowPayModal(false)}
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

// ─── CUSTOMER ROW ────────────────────────────────────────
function CustomerRow({ customer }) {
  // const { customers, addCustomer, addWalkinSale, masterProducts } = useApp()
  const { addOrder, checkStockWarnings, products } = useApp()
  const [open, setOpen] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [stockWarnings, setStockWarnings] = useState([])
  const [orderForm, setOrderForm] = useState({
    date: '', dueDate: '', method: 'Cash',
    items: [{ code: '', name: '', qty: 1, price: 0 }]
  })

  const allOrders = customer.orders
  const totalBilled = allOrders.reduce((s, o) => s + o.totalAmount, 0)
  const totalPaid = allOrders.reduce((s, o) =>
    s + o.payments.reduce((sp, p) => sp + p.amount, 0), 0)
  const balance = totalBilled - totalPaid
  const hasOverdue = allOrders.some(o => getOrderStatus(o) === 'overdue')
  const allPaid = allOrders.length > 0 && allOrders.every(o => getOrderStatus(o) === 'paid')

  const rowStyle = hasOverdue
    ? 'border-red-200 bg-red-50'
    : allPaid
    ? 'border-green-200 bg-green-50'
    : 'border-yellow-200 bg-yellow-50'

  function addItem() {
    setOrderForm({ ...orderForm, items: [...orderForm.items, { code: '', name: '', qty: 1, price: 0 }] })
  }

  function updateItem(index, field, value) {
  const updated = orderForm.items.map((item, i) =>
    i === index ? { ...item, [field]: value } : item
  )
  setOrderForm({ ...orderForm, items: updated })
  setStockWarnings([])
}

function selectProduct(index, productCode) {
  const product = products.find(p => p.code === productCode)
  if (!product) return
  const updated = orderForm.items.map((item, i) =>
    i === index ? {
      ...item,
      code: product.code,
      name: `${product.name} ${product.size}`,
      price: product.bulkPrice,
      _category: product.category
    } : item
  )
  setOrderForm({ ...orderForm, items: updated })
  setStockWarnings([])
}

  function removeItem(index) {
    setOrderForm({ ...orderForm, items: orderForm.items.filter((_, i) => i !== index) })
  }

  function handleSubmitOrder() {
  const validItems = orderForm.items.filter(i => i.code && i.qty && i.price)
  if (validItems.length === 0) return
  addOrder(customer.id, { ...orderForm, items: validItems })
  setOrderForm({ date: '', dueDate: '', method: 'Cash', items: [{ code: '', name: '', qty: 1, price: 0 }] })
  setShowOrderModal(false)
}

  const orderTotal = orderForm.items.reduce((s, i) => s + (i.qty * i.price), 0)

  return (
    <div className={`border rounded-xl overflow-hidden ${rowStyle}`}>
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:opacity-90 transition"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600 font-bold text-sm">{customer.name[0]}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-800">{customer.name}</p>
            <p className="text-xs text-gray-500">{customer.location} · {customer.phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-400">Billed / Paid / Balance</p>
            <p className="text-sm font-bold">
              ₹{totalBilled.toLocaleString()} /
              <span className="text-green-600"> ₹{totalPaid.toLocaleString()}</span> /
              <span className="text-red-500"> ₹{balance.toLocaleString()}</span>
            </p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            hasOverdue ? 'bg-red-100 text-red-600'
            : allPaid ? 'bg-green-100 text-green-600'
            : 'bg-yellow-100 text-yellow-600'
          }`}>
            {hasOverdue ? '⚠ Overdue' : allPaid ? '✅ Cleared' : '⏳ Pending'}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            {allOrders.length} order{allOrders.length !== 1 ? 's' : ''}
          </span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-200 bg-white p-4 space-y-3">
          {allOrders.map(order => (
            <OrderCard key={order.id} order={order} customerId={customer.id} />
          ))}
          <button
            onClick={e => { e.stopPropagation(); setShowOrderModal(true) }}
            className="w-full py-2 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-xl text-sm hover:bg-indigo-50 transition"
          >
            + New Order for {customer.name}
          </button>
        </div>
      )}

      {/* New Order Modal */}
      {showOrderModal && (
        <Modal title={`New Order — ${customer.name}`} onClose={() => setShowOrderModal(false)}>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Order Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={orderForm.date}
                  onChange={e => setOrderForm({ ...orderForm, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Due Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={orderForm.dueDate}
                  onChange={e => setOrderForm({ ...orderForm, dueDate: e.target.value })}
                />
              </div>
            </div>

            {/* Items */}
{/* Items */}
<div>
  <div className="flex items-center justify-between mb-2">
    <label className="text-sm font-medium text-gray-700">Items</label>
    <button onClick={addItem} className="text-xs text-indigo-600 hover:underline">
      + Add item
    </button>
  </div>
  <div className="space-y-3">
    {orderForm.items.map((item, i) => {
      const selectedProduct = products.find(p => p.code === item.code)
      const categories = [...new Set(products.map(p => p.category))]
      const selectedCategory = selectedProduct?.category || item._category || ''
      const categoryProducts = products.filter(p => p.category === selectedCategory)

      return (
        <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Item {i + 1}</span>
            {orderForm.items.length > 1 && (
              <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 text-sm">✕ Remove</button>
            )}
          </div>

          {/* Step 1: Category */}
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={selectedCategory}
           onChange={e => {
  const qty = parseInt(e.target.value) || 0
  const updated = orderForm.items.map((it, idx) =>
    idx === i ? { ...it, qty } : it
  )
  setOrderForm({ ...orderForm, items: updated })
  // Live stock check
  const warnings = checkStockWarnings(updated.filter(it => it.code && it.qty))
  setStockWarnings(warnings)
}}
          >
            <option value="">Select category</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Step 2: Size */}
          {selectedCategory && (
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              value={item.code}
              onChange={e => {
                const product = products.find(p => p.code === e.target.value)
                if (product) selectProduct(i, product.code)
              }}
            >
              <option value="">Select size</option>
              {categoryProducts.map(p => (
                <option key={p.code} value={p.code}>
                  Size {p.size} — Bulk: ₹{p.bulkPrice}
                </option>
              ))}
            </select>
          )}

          {/* Qty + Price + Total */}
          {item.code && (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Quantity</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                  value={item.qty}
                  onChange={e => {
                    const qty = parseInt(e.target.value) || 0
                    const updated = orderForm.items.map((it, idx) =>
                      idx === i ? { ...it, qty } : it
                    )
                    setOrderForm({ ...orderForm, items: updated })
                  }}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Price/pc (₹)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={item.price}
                  onChange={e => updateItem(i, 'price', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Total</label>
                <div className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-indigo-600 bg-indigo-50">
                  ₹{((item.qty || 0) * (item.price || 0)).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* Selected product info */}
          {selectedProduct && (
            <div className="flex gap-3 text-xs text-gray-400">
              <span className="font-mono">{selectedProduct.code}</span>
              <span>Bulk: ₹{selectedProduct.bulkPrice}</span>
              <span>Retail: ₹{selectedProduct.retailPrice}</span>
            </div>
          )}
        </div>
      )
    })}
  </div>
</div>

            {orderTotal > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 flex justify-between">
                <span className="text-sm text-indigo-700 font-medium">Order Total</span>
                <span className="font-bold text-indigo-700">₹{orderTotal.toLocaleString()}</span>
              </div>
            )}

            {stockWarnings.length > 0 && (
              <div className="space-y-1">
                {stockWarnings.map((w, i) => (
                  <div key={i} className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                    w.type === 'error'
                      ? 'bg-red-50 border border-red-200 text-red-700'
                      : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                  }`}>
                    <span>{w.type === 'error' ? '❌' : '⚠️'}</span>
                    <span>{w.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmitOrder}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              Create Order
            </button>
            <button
              onClick={() => setShowOrderModal(false)}
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

// ─── MAIN COMPONENT ──────────────────────────────────────
function Sales() {
  
  const [locationTab, setLocationTab] = useState('all')
  const [search, setSearch] = useState('')
  const { customers, addCustomer, addWalkinSale, products , walkinSales } = useApp()
  const [activeTab, setActiveTab] = useState('shops')
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [showNewWalkin, setShowNewWalkin] = useState(false)
  const [customerForm, setCustomerForm] = useState({ name: '', location: '', phone: '', locationType: 'local' })
  const [walkinForm, setWalkinForm] = useState({
    name: '', phone: '', method: 'Cash', date: '',
    items: [{ code: '', name: '', qty: 1, price: 0 }]
  })

  const totalBilled = customers.reduce((s, c) =>
    s + c.orders.reduce((so, o) => so + o.totalAmount, 0), 0)
  const totalPaid = customers.reduce((s, c) =>
    s + c.orders.reduce((so, o) =>
      so + o.payments.reduce((sp, p) => sp + p.amount, 0), 0), 0)
  const totalPending = totalBilled - totalPaid
  const overdueCount = customers.filter(c =>
    c.orders.some(o => getOrderStatus(o) === 'overdue')).length

   const filteredCustomers = customers.filter(c => {
  const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  const matchesLocation = locationTab === 'all' || c.locationType === locationTab
  return matchesSearch && matchesLocation
})
  function handleAddCustomer() {
    if (!customerForm.name || !customerForm.phone) return
    addCustomer(customerForm)
    setCustomerForm({ name: '', location: '', phone: '' })
    setShowNewCustomer(false)
  }

  function handleAddWalkin() {
    if (!walkinForm.name) return
    const validItems = walkinForm.items.filter(i => i.code && i.qty && i.price)
    const amount = validItems.reduce((s, i) => s + (i.qty * i.price), 0)
    addWalkinSale({ ...walkinForm, items: validItems, amount })
    setWalkinForm({ name: '', phone: '', method: 'Cash', date: '', items: [{ code: '', name: '', qty: 1, price: 0 }] })
    setShowNewWalkin(false)
  }

  function addWalkinItem() {
    setWalkinForm({ ...walkinForm, items: [...walkinForm.items, { code: '', name: '', qty: 1, price: 0 }] })
  }

  function updateWalkinItem(index, field, value) {
    const updated = walkinForm.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item)
    setWalkinForm({ ...walkinForm, items: updated })
  }

  function removeWalkinItem(index) {
    setWalkinForm({ ...walkinForm, items: walkinForm.items.filter((_, i) => i !== index) })
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sales & Collection</h2>
          <p className="text-gray-500 text-sm mt-1">Customer wise payment tracking</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewCustomer(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
          >
            + New Customer
          </button>
          <button
            onClick={() => setShowNewWalkin(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
          >
            + Walk-in Sale
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-xs text-gray-500">Total Billed</p>
          <p className="text-xl font-bold text-gray-800 mt-1">₹{totalBilled.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-xs text-gray-500">Received</p>
          <p className="text-xl font-bold text-green-600 mt-1">₹{totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-xl font-bold text-yellow-500 mt-1">₹{totalPending.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-xs text-gray-500">Overdue</p>
          <p className="text-xl font-bold text-red-500 mt-1">{overdueCount} shops</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {['shops', 'walk-in'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'shops' ? `Bulk / Shops (${customers.length})` : 'Walk-in'}
          </button>
        ))}
      </div>
       <div className="relative">
      <input
        type="text"
        placeholder="Search customer, phone or location..."
         className="border border-gray-300 rounded-lg w-[290px] px-3 py-2 flex place-self-end text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <Search size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-blue-500 h-[30px] w-[30px] rounded p-2" />
    </div>
      {/* Shops */}
      {activeTab === 'shops' && (
  <div className="space-y-3">
    <div className="flex gap-2">
      {['all', 'local', 'non-local'].map(t => (
        <button
          key={t}
          onClick={() => setLocationTab(t)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition ${
            locationTab === t
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {t === 'all' ? 'All' : t === 'local' ? '📍 Local' : '🚚 Non-Local'}
          {' '}({customers.filter(c => t === 'all' || c.locationType === t).length})
        </button>
      ))}
    </div>
    {filteredCustomers.map(c => (
      <CustomerRow key={c.id} customer={c} />
    ))}
  </div>
)}

      {/* Walk-in */}
      {activeTab === 'walk-in' && (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <p className="text-sm text-gray-500">
        Total: <span className="font-bold text-green-600">
          ₹{walkinSales.reduce((s, o) => s + o.amount, 0).toLocaleString()}
        </span>
      </p>
      <button
        onClick={() => setShowNewWalkin(true)}
        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
      >
        + Walk-in Sale
      </button>
    </div>
    {walkinSales.map(o => (
      <div key={o.id} className="bg-white border border-green-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800">{o.name}</p>
            <p className="text-xs text-gray-500">{o.phone} · {o.date}</p>
            <div className="flex gap-2 mt-1 flex-wrap">
              {o.items.map((item, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {item.code} × {item.qty}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-green-600">₹{o.amount.toLocaleString()}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              o.method === 'Cash' ? 'bg-green-100 text-green-700' :
              o.method === 'PhonePe' ? 'bg-purple-100 text-purple-700' :
              o.method === 'GPay' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>{o.method}</span>
          </div>
        </div>
      </div>
    ))}
  </div>
)}

      {/* New Customer Modal */}
      {showNewCustomer && (
        <Modal title="Add New Customer" onClose={() => setShowNewCustomer(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Shop Name</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={customerForm.name}
                onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })}
                placeholder="e.g. Sri Lakshmi Stores"
              />
            </div>
            <div>
  <label className="text-sm font-medium text-gray-700 block mb-1">Location Type</label>
  <div className="flex gap-2">
    {['local', 'non-local'].map(type => (
      <button
        key={type}
        onClick={() => setCustomerForm({ ...customerForm, locationType: type, location: '' })}
        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition capitalize ${
          customerForm.locationType === type
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-white text-gray-600 border-gray-300'
        }`}
      >
        {type === 'local' ? '📍 Local (Tirumala/Tirupati)' : '🚚 Non-Local'}
      </button>
    ))}
  </div>
</div>

<div>
  <label className="text-sm font-medium text-gray-700 block mb-1">Location</label>
  {customerForm.locationType === 'local' ? (
    <select
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      value={customerForm.location}
      onChange={e => setCustomerForm({ ...customerForm, location: e.target.value })}
    >
      <option value="">Select location</option>
      <option value="Tirumala">Tirumala</option>
      <option value="Tirupati">Tirupati</option>
    </select>
  ) : (
    <input
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      value={customerForm.location}
      onChange={e => setCustomerForm({ ...customerForm, location: e.target.value })}
      placeholder="e.g. Vijayawada, Guntur"
    />
  )}
</div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Phone</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={customerForm.phone}
                onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })}
                placeholder="9876543210"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddCustomer}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700"
              >
                Add Customer
              </button>
              <button
                onClick={() => setShowNewCustomer(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Walk-in Modal */}
      {showNewWalkin && (
        <Modal title="New Walk-in Sale" onClose={() => setShowNewWalkin(false)}>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Name</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={walkinForm.name}
                  onChange={e => setWalkinForm({ ...walkinForm, name: e.target.value })}
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Phone</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={walkinForm.phone}
                  onChange={e => setWalkinForm({ ...walkinForm, phone: e.target.value })}
                  placeholder="9876543210"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Method</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={walkinForm.method}
                  onChange={e => setWalkinForm({ ...walkinForm, method: e.target.value })}
                >
                  {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={walkinForm.date}
                  onChange={e => setWalkinForm({ ...walkinForm, date: e.target.value })}
                />
              </div>
            </div>
            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Items</label>
                <button onClick={addWalkinItem} className="text-xs text-indigo-600 hover:underline">
                  + Add item
                </button>
              </div>
              <div className="space-y-3">
                {walkinForm.items.map((item, i) => {
                  const selectedProduct = products.find(p => p.code === item.code)
                  const categories = [...new Set(products.map(p => p.category))]
                  const selectedCategory = selectedProduct?.category || item._category || ''
                  const categoryProducts = products.filter(p => p.category === selectedCategory)

                  return (
                    <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Item {i + 1}</span>
                        {walkinForm.items.length > 1 && (
                          <button onClick={() => removeWalkinItem(i)} className="text-red-400 text-sm">✕ Remove</button>
                        )}
                      </div>

                      {/* Category */}
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        value={selectedCategory}
                        onChange={e => {
                          const updated = walkinForm.items.map((it, idx) =>
                            idx === i ? { ...it, code: '', name: '', price: 0, _category: e.target.value } : it
                          )
                          setWalkinForm({ ...walkinForm, items: updated })
                        }}
                      >
                        <option value="">Select category</option>
                        {categories.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>

                      {/* Size */}
                      {selectedCategory && (
                        <select
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                          value={item.code}
                          onChange={e => {
                            const product = products.find(p => p.code === e.target.value)
                            if (product) {
                              const updated = walkinForm.items.map((it, idx) =>
                                idx === i ? {
                                  ...it,
                                  code: product.code,
                                  name: `${product.name} ${product.size}`,
                                  price: 0, // walk-in = manual price
                                  _category: product.category,
                                  _retailPrice: product.retailPrice
                                } : it
                              )
                              setWalkinForm({ ...walkinForm, items: updated })
                            }
                          }}
                        >
                          <option value="">Select size</option>
                          {categoryProducts.map(p => (
                            <option key={p.code} value={p.code}>
                              Size {p.size} — Retail: ₹{p.retailPrice}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Qty + Manual Price + Total */}
                      {item.code && (
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Quantity</label>
                            <input
                              type="number"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="0"
                              value={item.qty}
                              onChange={e => {
                                const updated = walkinForm.items.map((it, idx) =>
                                  idx === i ? { ...it, qty: parseInt(e.target.value) || 0 } : it
                                )
                                setWalkinForm({ ...walkinForm, items: updated })
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">
                              Price/pc (₹)
                              {item._retailPrice && (
                                <span className="ml-1 text-blue-500">ref: ₹{item._retailPrice}</span>
                              )}
                            </label>
                            <input
                              type="number"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Enter price"
                              value={item.price || ''}
                              onChange={e => {
                                const updated = walkinForm.items.map((it, idx) =>
                                  idx === i ? { ...it, price: parseFloat(e.target.value) || 0 } : it
                                )
                                setWalkinForm({ ...walkinForm, items: updated })
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Total</label>
                            <div className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-green-600 bg-green-50">
                              ₹{((item.qty || 0) * (item.price || 0)).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedProduct && (
                        <div className="flex gap-3 text-xs text-gray-400">
                          <span className="font-mono">{selectedProduct.code}</span>
                          <span className="text-blue-500">Retail ref: ₹{selectedProduct.retailPrice}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex justify-between">
              <span className="text-sm text-green-700 font-medium">Total</span>
              <span className="font-bold text-green-700">
                ₹{walkinForm.items.reduce((s, i) => s + (i.qty * i.price), 0).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleAddWalkin}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700"
            >
              Add Sale
            </button>
            <button
              onClick={() => setShowNewWalkin(false)}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Sales