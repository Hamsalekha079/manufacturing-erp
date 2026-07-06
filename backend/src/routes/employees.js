const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')
const auth = require('../middleware/auth')

// GET all employees
router.get('/', auth, async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        assignedProducts: {
          include: { }
        },
        attendanceLogs: { orderBy: { date: 'desc' } },
        productionLogs: { orderBy: { date: 'desc' } },
        salaryHistory: { orderBy: { createdAt: 'desc' } }
      }
    })
    res.json(employees)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST add employee
router.post('/', auth, async (req, res) => {
  try {
    const { assignedProducts, ...empData } = req.body
    const employee = await prisma.employee.create({
      data: {
        ...empData,
        assignedProducts: {
          create: assignedProducts || []
        }
      },
      include: { assignedProducts: true }
    })
    res.json(employee)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST log attendance
router.post('/:id/attendance', auth, async (req, res) => {
  try {
    const { date, status } = req.body
    const empId = parseInt(req.params.id)
    const dateObj = new Date(date)
    const existing = await prisma.attendanceLog.findFirst({
      where: { employeeId: empId, date: dateObj }
    })
    let log
    if (existing) {
      log = await prisma.attendanceLog.update({
        where: { id: existing.id },
        data: { status }
      })
    } else {
      log = await prisma.attendanceLog.create({
        data: { employeeId: empId, date: dateObj, status }
      })
    }
    res.json(log)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST log production
router.post('/:id/production', auth, async (req, res) => {
  try {
    const { date, productCode, qty, rate, workType } = req.body
    const empId = parseInt(req.params.id)
    const log = await prisma.productionLog.create({
      data: {
        employeeId: empId,
        productCode,
        date: new Date(date),
        qty,
        rate,
        workType: workType || null
      }
    })
    // update semi finished stock
    await prisma.semiFinishedStock.update({
      where: { productCode },
      data: { stock: { increment: qty } }
    })
    res.json(log)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST generate salary
router.post('/:id/salary/generate', auth, async (req, res) => {
  try {
    const { weekLabel, dateFrom, dateTo } = req.body
    const empId = parseInt(req.params.id)
    const employee = await prisma.employee.findUnique({
      where: { id: empId },
      include: { attendanceLogs: true, productionLogs: true }
    })
    let amount = 0
    const from = new Date(dateFrom)
    const to = new Date(dateTo)
    if (employee.salaryType === 'DAILY') {
      const logs = employee.attendanceLogs.filter(l => l.date >= from && l.date <= to)
      const days = logs.reduce((s, l) =>
        s + (l.status === 'present' ? 1 : l.status === 'half' ? 0.5 : 0), 0)
      amount = days * employee.dailyRate
    } else {
      const logs = employee.productionLogs.filter(l => l.date >= from && l.date <= to)
      amount = logs.reduce((s, l) => s + (l.qty * l.rate), 0)
    }
    const salary = await prisma.salaryRecord.create({
      data: { employeeId: empId, week: weekLabel, amount }
    })
    res.json(salary)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST pay salary
router.post('/:id/salary/:salaryId/pay', auth, async (req, res) => {
  try {
    const { method } = req.body
    const empId = parseInt(req.params.id)
    const salaryId = parseInt(req.params.salaryId)
    const salary = await prisma.salaryRecord.update({
      where: { id: salaryId },
      data: { paid: true, paidDate: new Date(), method }
    })
    const employee = await prisma.employee.findUnique({ where: { id: empId } })
    await prisma.expense.create({
      data: {
        category: 'Salary',
        description: `Salary paid - ${employee.name}`,
        amount: salary.amount,
        date: new Date()
      }
    })
    res.json(salary)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router