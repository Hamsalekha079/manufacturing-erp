import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api'


// ─── CONTEXT ─────────────────────────────────────────────
const AppContext = createContext(null)

function groupStock(flatList) {
  const groups = {}
  for (const item of flatList) {
    const p = item.product
    const category = p.category
    if (!groups[category]) {
      groups[category] = {
        group: category,
        code: p.code.split(' ')[0].split('-')[0],
        unit: 'pcs',
        low: 10,
        items: []
      }
    }
    groups[category].items.push({
      code: p.code,
      size: p.size,
      stock: item.stock
    })
  }
  return Object.values(groups)
}

export function AppProvider({ children }) {
  const [suppliers, setSuppliers] = useState([])
const [castingCenters, setCastingCenters] = useState([])
  const [walkinSales, setWalkinSales] = useState([])
const [products, setProducts] = useState([])
const [semiFinished, setSemiFinished] = useState([])
const [finished, setFinished] = useState([])
const [employees, setEmployees] = useState([])
const [customers, setCustomers] = useState([])
const [income, setIncome] = useState([])
const [expenses, setExpenses] = useState([])
const [categories, setCategories] = useState([])
const [auth, setAuth] = useState({
  isLoggedIn: !!localStorage.getItem('token'),
  username: 'admin',
  password: 'admin123',
  phone: '9876543210',
})

// Load data from API on mount
useEffect(() => {
  if (auth.isLoggedIn) loadAllData()
}, [auth.isLoggedIn])

async function loadAllData() {
  console.log('🔄 Loading data from backend...')
  try {
    const [prods, stockData, emps, custs, walkin, incomeData, expensesData, suppliersData, castingData, catsData] = await Promise.all([
  api.getProducts(),
  api.getStock(),
  api.getEmployees(),
  api.getCustomers(),
  api.getWalkin(),
  api.getIncome(),
  api.getExpenses(),
  api.getSuppliers(),
  api.getCasting(),
  api.getCategories(),
])
    console.log('✅ Products:', prods)
    console.log('✅ Stock:', stockData)
    console.log('✅ Employees:', emps)
    console.log('✅ Customers:', custs)
    console.log('✅ Walkin:', walkin)
    console.log('✅ Income:', incomeData)
    console.log('✅ Expenses:', expensesData)

    // Products
    setProducts(prods)

    // Stock — API returns { semi: [...], finished: [...] }
    // We need to convert flat list back to grouped format for frontend
    const semiGrouped = groupStock(stockData.semi)
    const finishedGrouped = groupStock(stockData.finished)
    setSemiFinished(semiGrouped)
    setFinished(finishedGrouped)

    // after setting other state:
setSuppliers(suppliersData.map(s => ({
  ...s,
  entries: s.purchases || []
})))
setCastingCenters(castingData.map(c => ({
  ...c,
  entries: c.castingEntries || []
})))
setCategories(catsData)
    // Employees — map API format to frontend format
    setEmployees(emps.map(e => ({
      ...e,
      attendanceLogs: e.attendanceLogs.map(l => ({
        ...l,
        date: l.date.split('T')[0]
      })),
      productionLogs: e.productionLogs.map(l => ({
        ...l,
        date: l.date.split('T')[0]
      })),
      salaryHistory: e.salaryHistory.map(s => ({
        ...s,
        paidDate: s.paidDate ? s.paidDate.split('T')[0] : null
      }))
    })))

    // Customers — map orders and payments
    setCustomers(custs.map(c => ({
      ...c,
      orders: c.orders.map(o => ({
        ...o,
        date: o.date.split('T')[0],
        dueDate: o.dueDate ? o.dueDate.split('T')[0] : null,
        items: o.items.map(i => ({ ...i, code: i.productCode })),
        payments: o.payments.map(p => ({
          ...p,
          date: p.date.split('T')[0]
        }))
      }))
    })))

    // Walkin sales
    setWalkinSales(walkin.map(w => ({
      ...w,
      date: w.date.split('T')[0],
      items: w.items.map(i => ({ ...i, code: i.productCode }))
    })))

    // Finance
    setIncome(incomeData.map(i => ({ ...i, date: i.date.split('T')[0] })))
    setExpenses(expensesData.map(e => ({ ...e, date: e.date.split('T')[0] })))

  } catch (err) {
    console.error('Failed to load data:', err)
  }
}
async function deleteProduct(code) {
  try {
    await api.deleteProduct(code)
    setProducts(prev => prev.filter(p => p.code !== code))
    const stockData = await api.getStock()
    setSemiFinished(groupStock(stockData.semi))
    setFinished(groupStock(stockData.finished))
  } catch (err) {
    console.error('Failed to delete product:', err)
  }
}
async function updateProductPrice(code, field, value) {
  setProducts(prev => prev.map(p =>
    p.code === code ? { ...p, [field]: parseFloat(value) } : p
  ))
  try {
    await api.updateProduct(code, { [field]: parseFloat(value) })
  } catch (err) {
    console.error('Failed to update product:', err)
  }
}


async function login(username, password) {
  try {
    const data = await api.login(username, password)
    localStorage.setItem('token', data.token)
    setAuth(prev => ({ ...prev, isLoggedIn: true, username: data.username }))
    return true
  } catch {
    return false
  }
}

function logout() {
  localStorage.removeItem('token')
  setAuth(prev => ({ ...prev, isLoggedIn: false }))
}

function resetPassword(newPassword) {
  setAuth(prev => ({ ...prev, password: newPassword }))
}
async function addProduct(product) {
  try {
    const newProduct = await api.addProduct(product)
    setProducts(prev => [...prev, newProduct])
    // Reload stock to include new product
    const stockData = await api.getStock()
    setSemiFinished(groupStock(stockData.semi))
    setFinished(groupStock(stockData.finished))
  } catch (err) {
    console.error('Failed to add product:', err)
  }
}
  // ─── STOCK FUNCTIONS ─────────────────────────────────────
  function getFinishedStock(itemCode) {
    for (const group of finished) {
      const item = group.items.find(i => i.code === itemCode)
      if (item) return { ...item, unit: group.unit, low: group.low }
    }
    return null
  }

  function checkStockWarnings(orderItems) {
    const warnings = []
    for (const orderItem of orderItems) {
      if (!orderItem.code) continue
      const stockItem = getFinishedStock(orderItem.code)
      if (!stockItem) continue
      if (stockItem.stock === 0) {
        warnings.push({ code: orderItem.code, type: 'error', message: `${orderItem.code} is OUT OF STOCK!` })
      } else if (stockItem.stock < orderItem.qty) {
        warnings.push({ code: orderItem.code, type: 'error', message: `${orderItem.code}: only ${stockItem.stock} available, you need ${orderItem.qty}` })
      } else if (stockItem.stock <= stockItem.low) {
        warnings.push({ code: orderItem.code, type: 'warning', message: `${orderItem.code}: low stock (${stockItem.stock} left)` })
      }
    }
    return warnings
  }

  // function deductFinishedStock(orderItems) {
  //   setFinished(prev => prev.map(group => ({
  //     ...group,
  //     items: group.items.map(item => {
  //       const orderItem = orderItems.find(o => o.code === item.code)
  //       if (!orderItem) return item
  //       return { ...item, stock: Math.max(0, item.stock - orderItem.qty) }
  //     })
  //   })))
  // }

 async function markAsFinished(itemCode, qty) {
  try {
    await api.markFinished({ productCode: itemCode, qty })
    setSemiFinished(prev => prev.map(group => ({
      ...group,
      items: group.items.map(item => {
        if (item.code !== itemCode) return item
        return { ...item, stock: Math.max(0, item.stock - qty) }
      })
    })))
    setFinished(prev => prev.map(group => ({
      ...group,
      items: group.items.map(item => {
        if (item.code !== itemCode) return item
        return { ...item, stock: item.stock + qty }
      })
    })))
  } catch (err) {
    console.error('Failed to mark as finished:', err)
  }
}

 async function adjustStock(type, groupCode, itemCode, adjustType, qty) {
  try {
    await api.adjustStock({ type, productCode: itemCode, adjustType, qty })
    const setter = type === 'semi' ? setSemiFinished : setFinished
    setter(prev => prev.map(group => {
      if (group.code !== groupCode) return group
      return {
        ...group,
        items: group.items.map(item => {
          if (item.code !== itemCode) return item
          const change = adjustType === 'add' ? qty : -qty
          return { ...item, stock: Math.max(0, item.stock + change) }
        })
      }
    }))
  } catch (err) {
    console.error('Failed to adjust stock:', err)
  }
}

  // ─── EMPLOYEE FUNCTIONS ──────────────────────────────────

async function logAttendance(empId, date, status) {
  try {
    await api.logAttendance(empId, { date, status })
    setEmployees(prev => prev.map(emp => {
      if (emp.id !== empId) return emp
      const existing = emp.attendanceLogs.find(l => l.date === date)
      if (existing) {
        return { ...emp, attendanceLogs: emp.attendanceLogs.map(l => l.date === date ? { ...l, status } : l) }
      }
      return { ...emp, attendanceLogs: [...emp.attendanceLogs, { id: Date.now(), date, status }] }
    }))
  } catch (err) {
    console.error('Failed to log attendance:', err)
  }
}

 async function logProduction(empId, date, code, name, qty, rate) {
  try {
    await api.logProduction(empId, { date, productCode: code, qty, rate })
    setEmployees(prev => prev.map(emp => {
      if (emp.id !== empId) return emp
      return {
        ...emp,
        productionLogs: [...emp.productionLogs, { id: Date.now(), date, code, name, qty, rate }]
      }
    }))
    setSemiFinished(prev => prev.map(group => ({
      ...group,
      items: group.items.map(item => {
        if (item.code !== code) return item
        return { ...item, stock: item.stock + qty }
      })
    })))
  } catch (err) {
    console.error('Failed to log production:', err)
  }
}

 async function generateWeeklySalary(empId, weekLabel, dateFrom, dateTo) {
  try {
    const salary = await api.generateSalary(empId, { weekLabel, dateFrom, dateTo })
    setEmployees(prev => prev.map(emp => {
      if (emp.id !== empId) return emp
      return { ...emp, salaryHistory: [...emp.salaryHistory, { ...salary, paid: false }] }
    }))
  } catch (err) {
    console.error('Failed to generate salary:', err)
  }
}

async function paySalary(empId, salaryId, method) {
  const today = new Date().toISOString().split('T')[0]
  try {
    await api.paySalary(empId, salaryId, { method })
    setEmployees(prev => prev.map(emp => {
      if (emp.id !== empId) return emp
      return {
        ...emp,
        salaryHistory: emp.salaryHistory.map(s =>
          s.id !== salaryId ? s : { ...s, paid: true, paidDate: today, method }
        )
      }
    }))
    setExpenses(prev => [...prev, {
      id: Date.now(), category: 'Salary',
      description: `Salary paid`, amount: 0, date: today
    }])
  } catch (err) {
    console.error('Failed to pay salary:', err)
  }
}

  // ─── SALES FUNCTIONS ─────────────────────────────────────
async function addCustomer(customerData) {
  try {
    const newCustomer = await api.addCustomer(customerData)
    setCustomers(prev => [...prev, { ...newCustomer, orders: [] }])
  } catch (err) {
    console.error('Failed to add customer:', err)
  }
}

 async function addOrder(customerId, orderData) {
  try {
    const newOrder = await api.addOrder(customerId, orderData)
    const mappedOrder = {
      ...newOrder,
      date: newOrder.date.split('T')[0],
      dueDate: newOrder.dueDate ? newOrder.dueDate.split('T')[0] : null,
      items: newOrder.items.map(i => ({ ...i, code: i.productCode })),
      payments: []
    }
    setCustomers(prev => prev.map(c =>
      c.id !== customerId ? c : { ...c, orders: [mappedOrder, ...c.orders] }
    ))
  } catch (err) {
    console.error('Failed to add order:', err)
  }
}


 async function markDelivered(customerId, orderId) {
  try {
    await api.markDelivered(customerId, orderId)
    setCustomers(prev => prev.map(c => {
      if (c.id !== customerId) return c
      return {
        ...c,
        orders: c.orders.map(o => {
          if (o.id !== orderId) return o
          return { ...o, deliveryStatus: 'delivered' } // removed deductFinishedStock
        })
      }
    }))
    // Reload stock from backend to get accurate numbers
    const stockData = await api.getStock()
    const semiGrouped = groupStock(stockData.semi)
    const finishedGrouped = groupStock(stockData.finished)
    setSemiFinished(semiGrouped)
    setFinished(finishedGrouped)
  } catch (err) {
    console.error('Failed to mark delivered:', err)
  }
}

 async function recordPayment(customerId, orderId, amount, method) {
  const today = new Date().toISOString().split('T')[0]
  try {
    await api.recordPayment(customerId, orderId, { amount, method })
    setCustomers(prev => prev.map(c => {
      if (c.id !== customerId) return c
      return {
        ...c,
        orders: c.orders.map(o => {
          if (o.id !== orderId) return o
          return {
            ...o,
            payments: [...o.payments, { id: Date.now(), date: today, amount, method }]
          }
        })
      }
    }))
    setIncome(prev => [...prev, {
      id: Date.now(), category: 'Sale',
      description: `Payment recorded`, amount, date: today
    }])
  } catch (err) {
    console.error('Failed to record payment:', err)
  }
}

async function addWalkinSale(walkinData) {
  const today = new Date().toISOString().split('T')[0]
  try {
    const newWalkin = await api.addWalkin(walkinData)
    setWalkinSales(prev => [{
      ...newWalkin,
      date: newWalkin.date.split('T')[0],
      items: newWalkin.items.map(i => ({ ...i, code: i.productCode }))
    }, ...prev])
    // Reload stock from backend
    const stockData = await api.getStock()
    setSemiFinished(groupStock(stockData.semi))
    setFinished(groupStock(stockData.finished))
    setIncome(prev => [...prev, {
      id: Date.now(), category: 'Sale',
      description: `Walk-in sale - ${walkinData.name}`,
      amount: walkinData.amount, date: today
    }])
  } catch (err) {
    console.error('Failed to add walkin sale:', err)
  }
}

  // ─── FINANCE FUNCTIONS ───────────────────────────────────
async function addIncome(entry) {
  try {
    const newIncome = await api.addIncome(entry)
    setIncome(prev => [{ ...newIncome, date: newIncome.date.split('T')[0] }, ...prev])
  } catch (err) {
    console.error('Failed to add income:', err)
  }
}

async function addEmployee(empData) {
  try {
    const payload = {
      name: empData.name,
      phone: empData.phone,
      role: empData.role,
      salaryType: empData.salaryType,
      dailyRate: parseFloat(empData.dailyRate) || 0,
      assignedProducts: (empData.assignedProducts || []).map(p => ({
        productCode: p.code,
        workType: p.workType || '',
        rate: parseFloat(p.rate) || 0
      }))
    }
    const newEmp = await api.addEmployee(payload)
    setEmployees(prev => [...prev, {
      ...newEmp,
      assignedProducts: newEmp.assignedProducts || [],
      attendanceLogs: [],
      productionLogs: [],
      salaryHistory: []
    }])
  } catch (err) {
    console.error('Failed to add employee:', err)
  }
}
async function addCategory(name) {
  try {
    const cat = await api.addCategory(name)
    setCategories(prev => [...prev, cat])
  } catch (err) {
    console.error('Failed to add category:', err)
  }
}

async function deleteCategory(id) {
  try {
    await api.deleteCategory(id)
    setCategories(prev => prev.filter(c => c.id !== id))
  } catch (err) {
    console.error('Failed to delete category:', err)
  }
}
async function addExpense(entry) {
  try {
    const newExpense = await api.addExpense(entry)
    setExpenses(prev => [{ ...newExpense, date: newExpense.date.split('T')[0] }, ...prev])
  } catch (err) {
    console.error('Failed to add expense:', err)
  }
}
  return (
    <AppContext.Provider value={{
       auth, login, logout, resetPassword,
  products, updateProductPrice, addProduct,walkinSales, addWalkinSale,deleteProduct,
  suppliers, setCastingCenters, castingCenters, setSuppliers,categories, addCategory, deleteCategory,

      // stock
      semiFinished, finished,
      getFinishedStock, checkStockWarnings,
      markAsFinished, adjustStock,
      // employees
      employees, addEmployee, logAttendance,
      logProduction, generateWeeklySalary, paySalary,
      // sales
      customers, addCustomer, addOrder,
      markDelivered, recordPayment,
      // finance
      income, expenses, addIncome, addExpense,
    }}>
      {children}
    </AppContext.Provider >
  )
}

export function useApp() {
  return useContext(AppContext)
}