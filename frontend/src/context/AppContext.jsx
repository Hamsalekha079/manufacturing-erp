import { createContext, useContext, useState } from 'react'


export const masterProducts = [
  // Kalash - Standard
  { code: 'Sd 30', name: 'Kalash Standard', size: '30', category: 'Kalash - Standard', bulkPrice: 350, retailPrice: 420, labourRate: 20 },
  { code: 'Sd 50', name: 'Kalash Standard', size: '50', category: 'Kalash - Standard', bulkPrice: 380, retailPrice: 450, labourRate: 22 },
  { code: 'Sd 70', name: 'Kalash Standard', size: '70', category: 'Kalash - Standard', bulkPrice: 420, retailPrice: 500, labourRate: 25 },
  { code: 'Sd 100', name: 'Kalash Standard', size: '100', category: 'Kalash - Standard', bulkPrice: 450, retailPrice: 540, labourRate: 28 },
  { code: 'Sd 150', name: 'Kalash Standard', size: '150', category: 'Kalash - Standard', bulkPrice: 520, retailPrice: 620, labourRate: 32 },
  { code: 'Sd 200', name: 'Kalash Standard', size: '200', category: 'Kalash - Standard', bulkPrice: 580, retailPrice: 700, labourRate: 36 },
  { code: 'Sd 250', name: 'Kalash Standard', size: '250', category: 'Kalash - Standard', bulkPrice: 650, retailPrice: 780, labourRate: 40 },
  // Kalash - Light Weight
  { code: 'LW 50', name: 'Kalash Light Weight', size: '50', category: 'Kalash - Light Weight', bulkPrice: 320, retailPrice: 380, labourRate: 18 },
  { code: 'LW 70', name: 'Kalash Light Weight', size: '70', category: 'Kalash - Light Weight', bulkPrice: 360, retailPrice: 430, labourRate: 20 },
  { code: 'LW 100', name: 'Kalash Light Weight', size: '100', category: 'Kalash - Light Weight', bulkPrice: 400, retailPrice: 480, labourRate: 22 },
  { code: 'LW 150', name: 'Kalash Light Weight', size: '150', category: 'Kalash - Light Weight', bulkPrice: 460, retailPrice: 550, labourRate: 26 },
  { code: 'LW 200', name: 'Kalash Light Weight', size: '200', category: 'Kalash - Light Weight', bulkPrice: 520, retailPrice: 620, labourRate: 30 },
  { code: 'LW 250', name: 'Kalash Light Weight', size: '250', category: 'Kalash - Light Weight', bulkPrice: 580, retailPrice: 700, labourRate: 34 },
  // Kalash - Asta Lakshmi
  { code: 'AL 100', name: 'Kalash Asta Lakshmi', size: '100', category: 'Kalash - Asta Lakshmi', bulkPrice: 750, retailPrice: 900, labourRate: 35 },
  { code: 'AL 150', name: 'Kalash Asta Lakshmi', size: '150', category: 'Kalash - Asta Lakshmi', bulkPrice: 800, retailPrice: 960, labourRate: 38 },
  { code: 'AL 200', name: 'Kalash Asta Lakshmi', size: '200', category: 'Kalash - Asta Lakshmi', bulkPrice: 850, retailPrice: 1020, labourRate: 42 },
  { code: 'AL 250', name: 'Kalash Asta Lakshmi', size: '250', category: 'Kalash - Asta Lakshmi', bulkPrice: 900, retailPrice: 1080, labourRate: 46 },
  // Panchapatra
  { code: 'BPP-S', name: 'Panchapatra', size: 'Small', category: 'Panchapatra', bulkPrice: 220, retailPrice: 260, labourRate: 15 },
  { code: 'BPP-M', name: 'Panchapatra', size: 'Medium', category: 'Panchapatra', bulkPrice: 280, retailPrice: 330, labourRate: 18 },
  { code: 'BPP-B', name: 'Panchapatra', size: 'Large', category: 'Panchapatra', bulkPrice: 340, retailPrice: 400, labourRate: 22 },
  // Glass
  { code: 'GL-M', name: 'Glass', size: 'Medium', category: 'Glass', bulkPrice: 180, retailPrice: 220, labourRate: 14 },
  { code: 'GL-L', name: 'Glass', size: 'Large', category: 'Glass', bulkPrice: 220, retailPrice: 260, labourRate: 16 },
  // Plate
  { code: 'BPL-1', name: 'Plate', size: '1', category: 'Plate', bulkPrice: 120, retailPrice: 150, labourRate: 10 },
  { code: 'BPL-2', name: 'Plate', size: '2', category: 'Plate', bulkPrice: 140, retailPrice: 170, labourRate: 11 },
  { code: 'BPL-3', name: 'Plate', size: '3', category: 'Plate', bulkPrice: 160, retailPrice: 190, labourRate: 12 },
  { code: 'BPL-4', name: 'Plate', size: '4', category: 'Plate', bulkPrice: 180, retailPrice: 220, labourRate: 13 },
  { code: 'BPL-5', name: 'Plate', size: '5', category: 'Plate', bulkPrice: 200, retailPrice: 240, labourRate: 14 },
  // Spoon
  { code: 'Ud-S', name: 'Spoon', size: 'Small', category: 'Spoon', bulkPrice: 180, retailPrice: 220, labourRate: 12 },
  { code: 'Ud-B', name: 'Spoon', size: 'Big', category: 'Spoon', bulkPrice: 220, retailPrice: 260, labourRate: 14 },
  // Kubera Kuncham
  { code: 'KK-S', name: 'Kubera Kuncham', size: 'Small', category: 'Kubera Kuncham', bulkPrice: 260, retailPrice: 320, labourRate: 18 },
  { code: 'KK-M', name: 'Kubera Kuncham', size: 'Medium', category: 'Kubera Kuncham', bulkPrice: 320, retailPrice: 380, labourRate: 22 },
  { code: 'KK-B', name: 'Kubera Kuncham', size: 'Large', category: 'Kubera Kuncham', bulkPrice: 380, retailPrice: 450, labourRate: 26 },
]
// Add to initial data at top
const initialWalkinSales = [
  {
    id: 1, name: 'Ramu', phone: '9876541235',
    date: '2026-05-13', method: 'Cash', amount: 2500,
    items: [{ code: 'Sd 50', name: 'Kalash Standard 50', qty: 2, price: 1250 }]
  },
  {
    id: 2, name: 'Suresh', phone: '9876541299',
    date: '2026-05-14', method: 'PhonePe', amount: 1800,
    items: [{ code: 'BPP-S', name: 'Panchapatra Small', qty: 3, price: 600 }]
  },
]
// ─── STOCK DATA ──────────────────────────────────────────
const initialSemiFinished = [
  { group: 'Kalash - Standard', code: 'Sd', unit: 'pcs', low: 10, items: [
    { code: 'Sd 30', size: '30', stock: 20 },
    { code: 'Sd 50', size: '50', stock: 15 },
    { code: 'Sd 70', size: '70', stock: 8 },
    { code: 'Sd 100', size: '100', stock: 5 },
    { code: 'Sd 150', size: '150', stock: 6 },
    { code: 'Sd 200', size: '200', stock: 3 },
    { code: 'Sd 250', size: '250', stock: 2 },
  ]},
  { group: 'Kalash - Light Weight', code: 'LW', unit: 'pcs', low: 10, items: [
    { code: 'LW 50', size: '50', stock: 10 },
    { code: 'LW 70', size: '70', stock: 8 },
    { code: 'LW 100', size: '100', stock: 5 },
    { code: 'LW 150', size: '150', stock: 3 },
    { code: 'LW 200', size: '200', stock: 4 },
    { code: 'LW 250', size: '250', stock: 2 },
  ]},
  { group: 'Kalash - Asta Lakshmi', code: 'AL', unit: 'pcs', low: 8, items: [
    { code: 'AL 100', size: '100', stock: 6 },
    { code: 'AL 150', size: '150', stock: 4 },
    { code: 'AL 200', size: '200', stock: 3 },
    { code: 'AL 250', size: '250', stock: 2 },
  ]},
  { group: 'Panchapatra', code: 'BPP', unit: 'pcs', low: 5, items: [
    { code: 'BPP-S', size: 'Small', stock: 12 },
    { code: 'BPP-M', size: 'Medium', stock: 8 },
    { code: 'BPP-B', size: 'Large', stock: 6 },
  ]},
  { group: 'Glass', code: 'GL', unit: 'pcs', low: 5, items: [
    { code: 'GL-M', size: 'Medium', stock: 4 },
    { code: 'GL-L', size: 'Large', stock: 3 },
  ]},
  { group: 'Plate', code: 'BPL', unit: 'pcs', low: 8, items: [
    { code: 'BPL-1', size: '1', stock: 10 },
    { code: 'BPL-2', size: '2', stock: 8 },
    { code: 'BPL-3', size: '3', stock: 6 },
    { code: 'BPL-4', size: '4', stock: 5 },
    { code: 'BPL-5', size: '5', stock: 4 },
  ]},
  { group: 'Spoon', code: 'Ud', unit: 'dozen', low: 3, items: [
    { code: 'Ud-S', size: 'Small', stock: 6 },
    { code: 'Ud-B', size: 'Big', stock: 5 },
  ]},
  { group: 'Kubera Kuncham', code: 'KK', unit: 'pcs', low: 5, items: [
    { code: 'KK-S', size: 'Small', stock: 8 },
    { code: 'KK-M', size: 'Medium', stock: 6 },
    { code: 'KK-B', size: 'Large', stock: 4 },
  ]},
]

const initialFinished = [
  { group: 'Kalash - Standard', code: 'Sd', unit: 'pcs', low: 20, items: [
    { code: 'Sd 30', size: '30', stock: 45 },
    { code: 'Sd 50', size: '50', stock: 30 },
    { code: 'Sd 70', size: '70', stock: 12 },
    { code: 'Sd 100', size: '100', stock: 8 },
    { code: 'Sd 150', size: '150', stock: 15 },
    { code: 'Sd 200', size: '200', stock: 6 },
    { code: 'Sd 250', size: '250', stock: 4 },
  ]},
  { group: 'Kalash - Light Weight', code: 'LW', unit: 'pcs', low: 20, items: [
    { code: 'LW 50', size: '50', stock: 18 },
    { code: 'LW 70', size: '70', stock: 22 },
    { code: 'LW 100', size: '100', stock: 10 },
    { code: 'LW 150', size: '150', stock: 5 },
    { code: 'LW 200', size: '200', stock: 8 },
    { code: 'LW 250', size: '250', stock: 3 },
  ]},
  { group: 'Kalash - Asta Lakshmi', code: 'AL', unit: 'pcs', low: 15, items: [
    { code: 'AL 100', size: '100', stock: 12 },
    { code: 'AL 150', size: '150', stock: 9 },
    { code: 'AL 200', size: '200', stock: 7 },
    { code: 'AL 250', size: '250', stock: 4 },
  ]},
  { group: 'Panchapatra', code: 'BPP', unit: 'pcs', low: 10, items: [
    { code: 'BPP-S', size: 'Small', stock: 25 },
    { code: 'BPP-M', size: 'Medium', stock: 18 },
    { code: 'BPP-B', size: 'Large', stock: 17 },
  ]},
  { group: 'Glass', code: 'GL', unit: 'pcs', low: 10, items: [
    { code: 'GL-M', size: 'Medium', stock: 5 },
    { code: 'GL-L', size: 'Large', stock: 3 },
  ]},
  { group: 'Plate', code: 'BPL', unit: 'pcs', low: 15, items: [
    { code: 'BPL-1', size: '1', stock: 20 },
    { code: 'BPL-2', size: '2', stock: 18 },
    { code: 'BPL-3', size: '3', stock: 15 },
    { code: 'BPL-4', size: '4', stock: 12 },
    { code: 'BPL-5', size: '5', stock: 10 },
  ]},
  { group: 'Spoon', code: 'Ud', unit: 'dozen', low: 5, items: [
    { code: 'Ud-S', size: 'Small', stock: 12 },
    { code: 'Ud-B', size: 'Big', stock: 12 },
  ]},
  { group: 'Kubera Kuncham', code: 'KK', unit: 'pcs', low: 10, items: [
    { code: 'KK-S', size: 'Small', stock: 18 },
    { code: 'KK-M', size: 'Medium', stock: 15 },
    { code: 'KK-B', size: 'Large', stock: 12 },
  ]},
]

// ─── EMPLOYEES DATA ──────────────────────────────────────
const initialEmployees = [
  {
    id: 1, name: 'Krishna Rao', phone: '9876540001', role: 'Operator',
    salaryType: 'DAILY', dailyRate: 600, status: 'active',
    assignedProducts: [],
    attendanceLogs: [
      { id: 1, date: '2026-05-19', status: 'present' },
      { id: 2, date: '2026-05-20', status: 'present' },
      { id: 3, date: '2026-05-21', status: 'half' },
      { id: 4, date: '2026-05-22', status: 'present' },
    ],
    productionLogs: [],
    salaryHistory: [
      { id: 1, week: 'May W1 (1-7)', amount: 3600, paid: true, paidDate: '2026-05-08', method: 'Cash' },
      { id: 2, week: 'May W2 (8-14)', amount: 3000, paid: true, paidDate: '2026-05-15', method: 'Cash' },
    ]
  },
  {
    id: 2, name: 'Srinivas', phone: '9876540002', role: 'Operator',
    salaryType: 'DAILY', dailyRate: 550, status: 'active',
    assignedProducts: [],
    attendanceLogs: [
      { id: 1, date: '2026-05-19', status: 'present' },
      { id: 2, date: '2026-05-20', status: 'absent' },
      { id: 3, date: '2026-05-21', status: 'present' },
      { id: 4, date: '2026-05-22', status: 'present' },
    ],
    productionLogs: [],
    salaryHistory: [
      { id: 1, week: 'May W1 (1-7)', amount: 2750, paid: true, paidDate: '2026-05-08', method: 'Cash' },
    ]
  },
  {
    id: 3, name: 'Ramesh', phone: '9876540003', role: 'Worker',
    salaryType: 'LABOUR', dailyRate: 0, status: 'active',
    assignedProducts: [
      { code: 'Sd 30', name: 'Kalash Standard 30', rate: 20 },
      { code: 'Sd 50', name: 'Kalash Standard 50', rate: 22 },
      { code: 'Sd 70', name: 'Kalash Standard 70', rate: 25 },
      { code: 'Sd 100', name: 'Kalash Standard 100', rate: 28 },
      { code: 'Sd 150', name: 'Kalash Standard 150', rate: 32 },
      { code: 'Sd 200', name: 'Kalash Standard 200', rate: 36 },
      { code: 'Sd 250', name: 'Kalash Standard 250', rate: 40 },
    ],
    attendanceLogs: [],
    productionLogs: [
      { id: 1, date: '2026-05-19', code: 'Sd 30', name: 'Kalash Standard 30', qty: 25, rate: 20 },
      { id: 2, date: '2026-05-20', code: 'Sd 50', name: 'Kalash Standard 50', qty: 18, rate: 22 },
      { id: 3, date: '2026-05-21', code: 'Sd 100', name: 'Kalash Standard 100', qty: 15, rate: 28 },
    ],
    salaryHistory: [
      { id: 1, week: 'May W1 (1-7)', amount: 3088, paid: false, paidDate: null, method: null },
    ]
  },
  {
    id: 4, name: 'Suresh', phone: '9876540004', role: 'Worker',
    salaryType: 'LABOUR', dailyRate: 0, status: 'active',
    assignedProducts: [
      { code: 'LW 50', name: 'Kalash LW 50', rate: 18 },
      { code: 'LW 100', name: 'Kalash LW 100', rate: 22 },
      { code: 'BPP-S', name: 'Panchapatra Small', rate: 15 },
      { code: 'BPP-M', name: 'Panchapatra Medium', rate: 18 },
      { code: 'BPP-B', name: 'Panchapatra Large', rate: 22 },
    ],
    attendanceLogs: [],
    productionLogs: [
      { id: 1, date: '2026-05-19', code: 'LW 50', name: 'Kalash LW 50', qty: 20, rate: 18 },
      { id: 2, date: '2026-05-20', code: 'BPP-M', name: 'Panchapatra Medium', qty: 15, rate: 18 },
    ],
    salaryHistory: []
  },
  {
    id: 5, name: 'Naresh', phone: '9876540005', role: 'Helper',
    salaryType: 'DAILY', dailyRate: 450, status: 'active',
    assignedProducts: [],
    attendanceLogs: [
      { id: 1, date: '2026-05-19', status: 'present' },
      { id: 2, date: '2026-05-20', status: 'present' },
      { id: 3, date: '2026-05-21', status: 'present' },
      { id: 4, date: '2026-05-22', status: 'present' },
    ],
    productionLogs: [],
    salaryHistory: []
  },
]

// ─── CUSTOMERS DATA ──────────────────────────────────────
const initialCustomers = [
  {
    id: 1, name: 'Sri Lakshmi Stores', location: 'Vijayawada', phone: '9876541234',
    orders: [
      {
        id: 101, date: '2026-05-10', deliveryStatus: 'delivered',
        items: [
          { code: 'Sd 100', name: 'Kalash Standard', qty: 10, price: 450 },
          { code: 'BPP-M', name: 'Panchapatra Medium', qty: 5, price: 280 },
        ],
        totalAmount: 5900,
        payments: [
          { id: 1, date: '2026-05-10', amount: 2000, method: 'Cash' },
          { id: 2, date: '2026-05-14', amount: 2000, method: 'PhonePe' },
        ],
        dueDate: '2026-05-20',
      },
      {
        id: 102, date: '2026-04-15', deliveryStatus: 'delivered',
        items: [
          { code: 'LW 150', name: 'Kalash Light Weight', qty: 8, price: 520 },
          { code: 'GL-M', name: 'Glass Medium', qty: 6, price: 180 },
        ],
        totalAmount: 5240,
        payments: [
          { id: 1, date: '2026-04-15', amount: 2000, method: 'GPay' },
          { id: 2, date: '2026-04-22', amount: 3240, method: 'Cash' },
        ],
        dueDate: '2026-04-30',
      },
    ],
  },
  {
    id: 2, name: 'Ganesh Traders', location: 'Guntur', phone: '9876541236',
    orders: [
      {
        id: 201, date: '2026-05-09', deliveryStatus: 'pending',
        items: [
          { code: 'Sd 150', name: 'Kalash Standard', qty: 15, price: 580 },
          { code: 'KK-M', name: 'Kubera Kuncham Medium', qty: 10, price: 320 },
        ],
        totalAmount: 11900, payments: [], dueDate: '2026-05-25',
      },
    ],
  },
  {
    id: 3, name: 'Venkateswara Stores', location: 'Tenali', phone: '9876541237',
    orders: [
      {
        id: 301, date: '2026-05-12', deliveryStatus: 'delivered',
        items: [
          { code: 'AL 200', name: 'Kalash Asta Lakshmi', qty: 6, price: 850 },
          { code: 'BPP-B', name: 'Panchapatra Large', qty: 8, price: 380 },
        ],
        totalAmount: 8140,
        payments: [{ id: 1, date: '2026-05-12', amount: 8140, method: 'Bank Transfer' }],
        dueDate: '2026-05-18',
      },
    ],
  },
  {
    id: 4, name: 'Balaji Agencies', location: 'Eluru', phone: '9876541238',
    orders: [
      {
        id: 401, date: '2026-05-08', deliveryStatus: 'delivered',
        items: [
          { code: 'Sd 70', name: 'Kalash Standard', qty: 20, price: 380 },
          { code: 'GL-L', name: 'Glass Large', qty: 10, price: 220 },
        ],
        totalAmount: 9800,
        payments: [{ id: 1, date: '2026-05-08', amount: 5000, method: 'GPay' }],
        dueDate: '2026-05-22',
      },
    ],
  },
  {
    id: 5, name: 'Durga Traders', location: 'Narsapur', phone: '9876541239',
    orders: [
      {
        id: 501, date: '2026-05-07', deliveryStatus: 'pending',
        items: [
          { code: 'KK-S', name: 'Kubera Kuncham Small', qty: 12, price: 280 },
          { code: 'BPL-3', name: 'Plate 3', qty: 15, price: 180 },
        ],
        totalAmount: 6060, payments: [], dueDate: '2026-05-24',
      },
    ],
  },
]

// ─── FINANCE DATA ────────────────────────────────────────
const initialIncome = [
  { id: 1, category: 'Sale', description: 'Payment - Sri Lakshmi Stores', amount: 4000, date: '2026-05-14' },
  { id: 2, category: 'Sale', description: 'Payment - Venkateswara Stores', amount: 8140, date: '2026-05-12' },
  { id: 3, category: 'Sale', description: 'Payment - Balaji Agencies', amount: 5000, date: '2026-05-08' },
]

const initialExpenses = [
  { id: 1, category: 'Material', description: 'Copper - Ravi Kumar', amount: 42500, date: '2026-05-13' },
  { id: 2, category: 'Salary', description: 'Salary - Krishna Rao May W1', amount: 3600, date: '2026-05-08' },
  { id: 3, category: 'Salary', description: 'Salary - Srinivas May W1', amount: 2750, date: '2026-05-08' },
  { id: 4, category: 'Casting', description: 'Casting - Bhaskar', amount: 6000, date: '2026-05-13' },
  { id: 5, category: 'Transport', description: 'Delivery charges', amount: 1500, date: '2026-05-12' },
]

// ─── CONTEXT ─────────────────────────────────────────────
const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [walkinSales, setWalkinSales] = useState(initialWalkinSales)
  const [products, setProducts] = useState(masterProducts)
  const [semiFinished, setSemiFinished] = useState(initialSemiFinished)
  const [finished, setFinished] = useState(initialFinished)
  const [employees, setEmployees] = useState(initialEmployees)
  const [customers, setCustomers] = useState(initialCustomers)
  const [income, setIncome] = useState(initialIncome)
  const [expenses, setExpenses] = useState(initialExpenses)


  function updateProductPrice(code, field, value) {
  setProducts(prev => prev.map(p =>
    p.code === code ? { ...p, [field]: parseFloat(value) } : p
  ))
}

function addProduct(product) {
  setProducts(prev => [...prev, product])
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

  function deductFinishedStock(orderItems) {
    setFinished(prev => prev.map(group => ({
      ...group,
      items: group.items.map(item => {
        const orderItem = orderItems.find(o => o.code === item.code)
        if (!orderItem) return item
        return { ...item, stock: Math.max(0, item.stock - orderItem.qty) }
      })
    })))
  }

  function markAsFinished(itemCode, qty) {
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
  }

  function adjustStock(type, groupCode, itemCode, adjustType, qty) {
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
  }

  // ─── EMPLOYEE FUNCTIONS ──────────────────────────────────
  function addEmployee(empData) {
    const newEmp = {
      id: Date.now(),
      ...empData,
      status: 'active',
      attendanceLogs: [],
      productionLogs: [],
      salaryHistory: [],
    }
    setEmployees(prev => [...prev, newEmp])
  }

  function logAttendance(empId, date, status) {
    setEmployees(prev => prev.map(emp => {
      if (emp.id !== empId) return emp
      const existing = emp.attendanceLogs.find(l => l.date === date)
      if (existing) {
        return { ...emp, attendanceLogs: emp.attendanceLogs.map(l => l.date === date ? { ...l, status } : l) }
      }
      return { ...emp, attendanceLogs: [...emp.attendanceLogs, { id: Date.now(), date, status }] }
    }))
  }

  function logProduction(empId, date, code, name, qty, rate) {
    setEmployees(prev => prev.map(emp => {
      if (emp.id !== empId) return emp
      return {
        ...emp,
        productionLogs: [...emp.productionLogs, { id: Date.now(), date, code, name, qty, rate }]
      }
    }))
    // also add to semi-finished stock
    setSemiFinished(prev => prev.map(group => ({
      ...group,
      items: group.items.map(item => {
        if (item.code !== code) return item
        return { ...item, stock: item.stock + qty }
      })
    })))
  }

  function generateWeeklySalary(empId, weekLabel, dateFrom, dateTo) {
    setEmployees(prev => prev.map(emp => {
      if (emp.id !== empId) return emp
      let amount = 0
      if (emp.salaryType === 'DAILY') {
        const logs = emp.attendanceLogs.filter(l => l.date >= dateFrom && l.date <= dateTo)
        const days = logs.reduce((s, l) => s + (l.status === 'present' ? 1 : l.status === 'half' ? 0.5 : 0), 0)
        amount = days * emp.dailyRate
      } else {
        const logs = emp.productionLogs.filter(l => l.date >= dateFrom && l.date <= dateTo)
        amount = logs.reduce((s, l) => s + (l.qty * l.rate), 0)
      }
      const newSalary = { id: Date.now(), week: weekLabel, amount, paid: false, paidDate: null, method: null }
      return { ...emp, salaryHistory: [...emp.salaryHistory, newSalary] }
    }))
  }

  function paySalary(empId, salaryId, method) {
    const today = new Date().toISOString().split('T')[0]
    let paidAmount = 0
    let empName = ''
    setEmployees(prev => prev.map(emp => {
      if (emp.id !== empId) return emp
      empName = emp.name
      return {
        ...emp,
        salaryHistory: emp.salaryHistory.map(s => {
          if (s.id !== salaryId) return s
          paidAmount = s.amount
          return { ...s, paid: true, paidDate: today, method }
        })
      }
    }))
    // auto add to expenses
    if (paidAmount > 0) {
      setExpenses(prev => [...prev, {
        id: Date.now(),
        category: 'Salary',
        description: `Salary paid - ${empName}`,
        amount: paidAmount,
        date: today
      }])
    }
  }

  // ─── SALES FUNCTIONS ─────────────────────────────────────
  function addCustomer(customerData) {
    setCustomers(prev => [...prev, { id: Date.now(), ...customerData, orders: [] }])
  }

  function addOrder(customerId, orderData) {
    const newOrder = {
      id: Date.now(),
      date: orderData.date || new Date().toISOString().split('T')[0],
      deliveryStatus: 'pending',
      items: orderData.items,
      totalAmount: orderData.items.reduce((s, i) => s + (i.qty * i.price), 0),
      payments: orderData.paidAmount > 0 ? [{
        id: Date.now(),
        date: orderData.date || new Date().toISOString().split('T')[0],
        amount: orderData.paidAmount,
        method: orderData.method
      }] : [],
      dueDate: orderData.dueDate
    }
    setCustomers(prev => prev.map(c => {
      if (c.id !== customerId) return c
      return { ...c, orders: [newOrder, ...c.orders] }
    }))
  }

  function markDelivered(customerId, orderId) {
    // deduct stock when delivered
    setCustomers(prev => prev.map(c => {
      if (c.id !== customerId) return c
      return {
        ...c,
        orders: c.orders.map(o => {
          if (o.id !== orderId) return o
          if (o.deliveryStatus === 'pending') {
            deductFinishedStock(o.items)
          }
          return { ...o, deliveryStatus: 'delivered' }
        })
      }
    }))
  }

  function recordPayment(customerId, orderId, amount, method) {
    const today = new Date().toISOString().split('T')[0]
    let customerName = ''
    setCustomers(prev => prev.map(c => {
      if (c.id !== customerId) return c
      customerName = c.name
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
    // auto add to income
    setIncome(prev => [...prev, {
      id: Date.now(),
      category: 'Sale',
      description: `Payment - ${customerName}`,
      amount,
      date: today
    }])
  }

  function addWalkinSale(walkinData) {
  const today = new Date().toISOString().split('T')[0]
  const newWalkin = {
    id: Date.now(),
    name: walkinData.name,
    phone: walkinData.phone,
    date: walkinData.date || today,
    method: walkinData.method,
    amount: walkinData.amount,
    items: walkinData.items
  }
  setWalkinSales(prev => [newWalkin, ...prev])
  deductFinishedStock(walkinData.items)
  setIncome(prev => [...prev, {
    id: Date.now(),
    category: 'Sale',
    description: `Walk-in sale - ${walkinData.name}`,
    amount: walkinData.amount,
    date: walkinData.date || today
  }])
}

  // ─── FINANCE FUNCTIONS ───────────────────────────────────
  function addIncome(entry) {
    setIncome(prev => [{ id: Date.now(), ...entry }, ...prev])
  }

  function addExpense(entry) {
    setExpenses(prev => [{ id: Date.now(), ...entry }, ...prev])
  }

  return (
    <AppContext.Provider value={{
  products, updateProductPrice, addProduct,walkinSales, addWalkinSale,
  masterProducts,
      // stock
      semiFinished, finished,
      getFinishedStock, checkStockWarnings,
      deductFinishedStock, markAsFinished, adjustStock,
      // employees
      employees, addEmployee, logAttendance,
      logProduction, generateWeeklySalary, paySalary,
      // sales
      customers, addCustomer, addOrder,
      markDelivered, recordPayment, addWalkinSale,
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