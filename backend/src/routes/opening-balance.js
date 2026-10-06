const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')
const auth = require('../middleware/auth')

// ─── SUPPLIER OPENING BALANCE ────────────────────────────
router.post('/supplier', auth, async (req, res) => {
  try {
    const { supplierId, orderedKg, receivedKg, totalAmount, paidAmount, lastDate, lastPaymentType, note } = req.body
    const pendingKg = Math.max(0, parseFloat(orderedKg || 0) - parseFloat(receivedKg || 0))
    const existing = await prisma.supplierOpeningBalance.findUnique({ where: { supplierId: parseInt(supplierId) } })
    const data = {
      orderedKg: parseFloat(orderedKg || 0),
      receivedKg: parseFloat(receivedKg || 0),
      pendingKg,
      totalAmount: parseFloat(totalAmount || 0),
      paidAmount: parseFloat(paidAmount || 0),
      lastDate: lastDate ? new Date(lastDate) : null,
      lastPaymentType: lastPaymentType || null,
      note: note || null
    }
    let balance
    if (existing) {
      balance = await prisma.supplierOpeningBalance.update({ where: { supplierId: parseInt(supplierId) }, data })
    } else {
      balance = await prisma.supplierOpeningBalance.create({ data: { supplierId: parseInt(supplierId), ...data } })
    }
    res.json(balance)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/supplier/:supplierId', auth, async (req, res) => {
  try {
    const balance = await prisma.supplierOpeningBalance.findUnique({
      where: { supplierId: parseInt(req.params.supplierId) }
    })
    res.json(balance || null)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── CASTING OPENING BALANCE ─────────────────────────────
router.post('/casting', auth, async (req, res) => {
  try {
    const { centerId, type, sentKg, returnedKg, totalAmount, paidAmount, lastDate, lastPaymentType, note } = req.body
    const pendingKg = Math.max(0, parseFloat(sentKg || 0) - parseFloat(returnedKg || 0))
    const existing = await prisma.castingOpeningBalance.findFirst({
      where: { centerId: parseInt(centerId), type: type || 'ROUND1' }
    })
    const data = {
      centerId: parseInt(centerId),
      type: type || 'ROUND1',
      sentKg: parseFloat(sentKg || 0),
      returnedKg: parseFloat(returnedKg || 0),
      pendingKg,
      totalAmount: parseFloat(totalAmount || 0),
      paidAmount: parseFloat(paidAmount || 0),
      lastDate: lastDate ? new Date(lastDate) : null,
      lastPaymentType: lastPaymentType || null,
      note: note || null
    }
    let balance
    if (existing) {
      balance = await prisma.castingOpeningBalance.update({ where: { id: existing.id }, data })
    } else {
      balance = await prisma.castingOpeningBalance.create({ data })
    }
    res.json(balance)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/casting/:centerId', auth, async (req, res) => {
  try {
    const balances = await prisma.castingOpeningBalance.findMany({
      where: { centerId: parseInt(req.params.centerId) }
    })
    res.json(balances)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── CUSTOMER OPENING BALANCE ─────────────────────────────
router.post('/customer', auth, async (req, res) => {
  try {
    const { customerId, totalBilled, amountReceived, lastDate, lastPaymentType, note } = req.body
    const existing = await prisma.customerOpeningBalance.findUnique({
      where: { customerId: parseInt(customerId) }
    })
    const data = {
      totalBilled: parseFloat(totalBilled || 0),
      amountReceived: parseFloat(amountReceived || 0),
      lastDate: lastDate ? new Date(lastDate) : null,
      lastPaymentType: lastPaymentType || null,
      note: note || null
    }
    let balance
    if (existing) {
      balance = await prisma.customerOpeningBalance.update({ where: { customerId: parseInt(customerId) }, data })
    } else {
      balance = await prisma.customerOpeningBalance.create({ data: { customerId: parseInt(customerId), ...data } })
    }
    res.json(balance)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/customer/:customerId', auth, async (req, res) => {
  try {
    const balance = await prisma.customerOpeningBalance.findUnique({
      where: { customerId: parseInt(req.params.customerId) }
    })
    res.json(balance || null)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── EMPLOYEE OPENING BALANCE ─────────────────────────────
router.post('/employee', auth, async (req, res) => {
  try {
    const { employeeId, pendingSalary, pendingAdvance, lastDate, note } = req.body
    const existing = await prisma.employeeOpeningBalance.findUnique({
      where: { employeeId: parseInt(employeeId) }
    })
    const data = {
      pendingSalary: parseFloat(pendingSalary || 0),
      pendingAdvance: parseFloat(pendingAdvance || 0),
      lastDate: lastDate ? new Date(lastDate) : null,
      note: note || null
    }
    let balance
    if (existing) {
      balance = await prisma.employeeOpeningBalance.update({ where: { employeeId: parseInt(employeeId) }, data })
    } else {
      balance = await prisma.employeeOpeningBalance.create({ data: { employeeId: parseInt(employeeId), ...data } })
    }
    res.json(balance)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/employee/:employeeId', auth, async (req, res) => {
  try {
    const balance = await prisma.employeeOpeningBalance.findUnique({
      where: { employeeId: parseInt(req.params.employeeId) }
    })
    res.json(balance || null)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── FINANCE OPENING BALANCE ──────────────────────────────
router.post('/finance', auth, async (req, res) => {
  try {
    const { cashInHand, bankBalance, date, note } = req.body
    // Always upsert single record
    const existing = await prisma.financeOpeningBalance.findFirst()
    let balance
    const data = {
      cashInHand: parseFloat(cashInHand || 0),
      bankBalance: parseFloat(bankBalance || 0),
      date: date ? new Date(date) : new Date(),
      note: note || null
    }
    if (existing) {
      balance = await prisma.financeOpeningBalance.update({ where: { id: existing.id }, data })
    } else {
      balance = await prisma.financeOpeningBalance.create({ data })
    }
    res.json(balance)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/finance', auth, async (req, res) => {
  try {
    const balance = await prisma.financeOpeningBalance.findFirst()
    res.json(balance || null)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── GET ALL OPENING BALANCES ─────────────────────────────
router.get('/all', auth, async (req, res) => {
  try {
    const [suppliers, casting, customers, employees, finance] = await Promise.all([
      prisma.supplierOpeningBalance.findMany({ include: { supplier: true } }),
      prisma.castingOpeningBalance.findMany({ include: { center: true } }),
      prisma.customerOpeningBalance.findMany({ include: { customer: true } }),
      prisma.employeeOpeningBalance.findMany({ include: { employee: true } }),
      prisma.financeOpeningBalance.findFirst()
    ])
    res.json({ suppliers, casting, customers, employees, finance })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router