// const BASE_URL = 'http://localhost:5000/api'
// const BASE_URL = 'https://manufacturing-erp-xi.vercel.app/api'
const BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`
function getToken() {
  return localStorage.getItem('token')
}

async function request(method, path, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    }
  }
  if (body) options.body = JSON.stringify(body)
  const res = await fetch(`${BASE_URL}${path}`, options)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  // Auth
  login: (username, password) => request('POST', '/auth/login', { username, password }),
  resetPassword: (username, phone, newPassword) =>
    request('POST', '/auth/reset-password', { username, phone, newPassword }),

  // Products
  getProducts: () => request('GET', '/products'),
  addProduct: (data) => request('POST', '/products', data),
  updateProduct: (code, data) => request('PATCH', `/products/${code}`, data),
  getCategories: () => request('GET', '/products/categories'),
  addCategory: (name) => request('POST', '/products/categories', { name }),
  deleteCategory: (id) => request('DELETE', `/products/categories/${id}`),
deleteProduct: (code) => request('DELETE', `/products/${code}`),
  // Stock
  getStock: () => request('GET', '/stock'),
  adjustStock: (data) => request('PATCH', '/stock/adjust', data),
  markFinished: (data) => request('PATCH', '/stock/mark-finished', data),

  // Employees
  getEmployees: () => request('GET', '/employees'),
  addEmployee: (data) => request('POST', '/employees', data),
  logAttendance: (id, data) => request('POST', `/employees/${id}/attendance`, data),
  logProduction: (id, data) => request('POST', `/employees/${id}/production`, data),
  generateSalary: (id, data) => request('POST', `/employees/${id}/salary/generate`, data),
  paySalary: (id, salaryId, data) => request('POST', `/employees/${id}/salary/${salaryId}/pay`, data),
  giveAdvance: (id, data) => request('POST', `/employees/${id}/advance`, data),
getAdvances: (id) => request('GET', `/employees/${id}/advances`),

  // Customers
  getCustomers: () => request('GET', '/customers'),
  addCustomer: (data) => request('POST', '/customers', data),
  addOrder: (customerId, data) => request('POST', `/customers/${customerId}/orders`, data),
  markDelivered: (customerId, orderId) =>
    request('PATCH', `/customers/${customerId}/orders/${orderId}/deliver`, {}),
  recordPayment: (customerId, orderId, data) =>
    request('POST', `/customers/${customerId}/orders/${orderId}/payment`, data),

  // Walkin
  getWalkin: () => request('GET', '/customers/walkin'),
  addWalkin: (data) => request('POST', '/customers/walkin', data),

  // Finance
  getIncome: () => request('GET', '/finance/income'),
  getExpenses: () => request('GET', '/finance/expenses'),
  addIncome: (data) => request('POST', '/finance/income', data),
  addExpense: (data) => request('POST', '/finance/expenses', data),

  // Materials
  getSuppliers: () => request('GET', '/materials/suppliers'),
  addPurchase: (data) => request('POST', '/materials/purchases', data),
  getCasting: () => request('GET', '/materials/casting'),
  addCastingCenter: (data) => request('POST', '/materials/casting-centers', data),
  addCasting: (data) => request('POST', '/materials/casting', data),
  recordCastingPayment: (id, amount, date, note) =>
  request('POST', `/materials/casting/${id}/payment`, { amount, date, note }),
  receivePendingCasting: (id, additionalKg) =>
  request('PATCH', `/materials/casting/${id}/receive`, { additionalKg }),
  getProduction: () => request('GET', '/materials/production'),
  addProduction: (data) => request('POST', '/materials/production', data),
  addSupplier: (data) => request('POST', '/materials/suppliers', data),
  recordSupplierPayment: (purchaseId, amount, date, note) =>
  request('POST', `/materials/purchases/${purchaseId}/payment`, { amount, date, note }),
  receivePendingKg: (purchaseId, additionalKg) =>
  request('PATCH', `/materials/purchases/${purchaseId}/receive`, { additionalKg }),
  recordWasteCastingPayment: (id, amount) =>
  request('POST', `/materials/waste-casting/${id}/payment`, { amount }),
receivePendingWasteCasting: (id, additionalKg) =>
  request('PATCH', `/materials/waste-casting/${id}/receive`, { additionalKg }),

recordSalaryPayment: (empId, salaryId, data) =>
  request('POST', `/employees/${empId}/salary/${salaryId}/payment`, data),
recordAdvanceRepayment: (empId, advanceId, data) =>
  request('POST', `/employees/${empId}/advance/${advanceId}/repayment`, data),
logWeeklyAttendance: (id, data) => request('POST', `/employees/${id}/weekly-attendance`, data),
// Opening Balance
getOpeningBalances: () => request('GET', '/opening-balance/all'),
saveSupplierOB: (data) => request('POST', '/opening-balance/supplier', data),
saveCastingOB: (data) => request('POST', '/opening-balance/casting', data),
saveCustomerOB: (data) => request('POST', '/opening-balance/customer', data),
saveEmployeeOB: (data) => request('POST', '/opening-balance/employee', data),
saveFinanceOB: (data) => request('POST', '/opening-balance/finance', data),

bulkAttendance: (data) => request('POST', '/employees/attendance/bulk', data),
bulkProduction: (data) => request('POST', '/employees/production/bulk', data),
generateAllSalary: (data) => request('POST', '/employees/salary/generate-all', data),
}