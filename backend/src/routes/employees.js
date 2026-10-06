const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')
const auth = require('../middleware/auth')

// GET all employees
router.get('/', auth, async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        assignedProducts: true,
        weeklyAttendance: { orderBy: { dateFrom: 'desc' } },
        productionLogs: { orderBy: { date: 'desc' } },
        salaryHistory: {
          include: { payments: { orderBy: { date: 'desc' } } },
          orderBy: { createdAt: 'desc' }
        },
        advances: {
          include: { repayments: { orderBy: { date: 'desc' } } },
          orderBy: { date: 'desc' }
        },
        openingBalance: true
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
    const { assignedProducts, obPendingSalary, obPendingAdvance, obDate, obNote, ...empData } = req.body
    const employee = await prisma.employee.create({
      data: {
        ...empData,
        assignedProducts: {
          create: (assignedProducts || []).map(p => ({
            productCode: p.productCode || p.code,
            workType: p.workType || '',
            rate: parseFloat(p.rate) || 0
          }))
        }
      },
      include: {
        assignedProducts: true,
        weeklyAttendance: true,
        productionLogs: true,
        salaryHistory: { include: { payments: true } },
        advances: { include: { repayments: true } },
        openingBalance: true
      }
    })
    if (parseFloat(obPendingSalary || 0) > 0 || parseFloat(obPendingAdvance || 0) > 0) {
      await prisma.employeeOpeningBalance.create({
        data: {
          employeeId: employee.id,
          pendingSalary: parseFloat(obPendingSalary || 0),
          pendingAdvance: parseFloat(obPendingAdvance || 0),
          lastDate: obDate ? new Date(obDate) : null,
          note: obNote || null
        }
      })
    }
    res.json(employee)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST log weekly attendance
router.post('/:id/weekly-attendance', auth, async (req, res) => {
  try {
    const { weekLabel, dateFrom, dateTo, fullDays, halfDays } = req.body
    const empId = parseInt(req.params.id)
    const attendance = await prisma.weeklyAttendance.create({
      data: {
        employeeId: empId,
        weekLabel,
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
        fullDays: parseInt(fullDays || 0),
        halfDays: parseInt(halfDays || 0)
      }
    })
    res.json(attendance)
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
        qty: parseInt(qty),
        rate: parseFloat(rate),
        workType: workType || null
      }
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
      include: { weeklyAttendance: true, productionLogs: true }
    })
    let amount = 0
    const from = new Date(dateFrom)
    const to = new Date(dateTo)
    if (employee.salaryType === 'DAILY') {
      const weekAtt = employee.weeklyAttendance.find(w => {
        const wFrom = new Date(w.dateFrom)
        const wTo = new Date(w.dateTo)
        return wFrom >= from && wTo <= to
      })
      if (weekAtt) {
        amount = (weekAtt.fullDays * employee.dailyRate) + (weekAtt.halfDays * (employee.dailyRate / 2))
      }
    } else {
      const logs = employee.productionLogs.filter(l => { const d = new Date(l.date); return d >= from && d <= to })
      amount = logs.reduce((s, l) => s + (l.qty * l.rate), 0)
    }
    const salary = await prisma.salaryRecord.create({
      data: { employeeId: empId, week: weekLabel, amount, paidAmount: 0, advanceDeducted: 0 }
    })
    res.json(salary)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST record salary payment (partial)
router.post('/:id/salary/:salaryId/payment', auth, async (req, res) => {
  try {
    const { amount, method, date, note } = req.body
    const salaryId = parseInt(req.params.salaryId)
    const empId = parseInt(req.params.id)
    const payment = await prisma.salaryPayment.create({
      data: {
        salaryId,
        amount: parseFloat(amount),
        method: method || null,
        date: date ? new Date(date) : new Date(),
        note: note || null
      }
    })
    const salary = await prisma.salaryRecord.update({
      where: { id: salaryId },
      data: { paidAmount: { increment: parseFloat(amount) } }
    })
    if (salary.paidAmount >= salary.amount) {
      await prisma.salaryRecord.update({
        where: { id: salaryId },
        data: { paid: true, paidDate: new Date(), method: method || null }
      })
    }
    const emp = await prisma.employee.findUnique({ where: { id: empId } })
    await prisma.expense.create({
      data: { category: 'Salary', description: `Salary payment - ${emp.name}`, amount: parseFloat(amount), date: date ? new Date(date) : new Date() }
    })
    res.json(payment)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST give advance
router.post('/:id/advance', auth, async (req, res) => {
  try {
    const { amount, date, note } = req.body
    const empId = parseInt(req.params.id)
    const advance = await prisma.employeeAdvance.create({
      data: {
        employeeId: empId,
        amount: parseFloat(amount),
        remainingAmount: parseFloat(amount),
        date: date ? new Date(date) : new Date(),
        note: note || null
      }
    })
    const emp = await prisma.employee.findUnique({ where: { id: empId } })
    await prisma.expense.create({
      data: { category: 'Salary', description: `Advance - ${emp.name}`, amount: parseFloat(amount), date: date ? new Date(date) : new Date() }
    })
    res.json(advance)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST record advance repayment
router.post('/:id/advance/:advanceId/repayment', auth, async (req, res) => {
  try {
    const { amount, method, date, note } = req.body
    const advanceId = parseInt(req.params.advanceId)
    const repayment = await prisma.advanceRepayment.create({
      data: {
        advanceId,
        amount: parseFloat(amount),
        method: method || null,
        date: date ? new Date(date) : new Date(),
        note: note || null
      }
    })
    const totalRepaid = (await prisma.advanceRepayment.aggregate({
      where: { advanceId },
      _sum: { amount: true }
    }))._sum.amount || 0
    const advance = await prisma.employeeAdvance.findUnique({ where: { id: advanceId } })
    const remaining = Math.max(0, advance.amount - totalRepaid)
    await prisma.employeeAdvance.update({
      where: { id: advanceId },
      data: { remainingAmount: remaining, recovered: remaining <= 0 }
    })
    res.json(repayment)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
router.post('/:id/attendance', auth, async (req, res) => {
  try {
    const { date, status } = req.body
    const empId = parseInt(req.params.id)
    const dateObj = new Date(date)
    const existing = await prisma.weeklyAttendance.findFirst({
      where: { employeeId: empId, dateFrom: dateObj }
    })
    let att
    if (existing) {
      att = await prisma.weeklyAttendance.update({
        where: { id: existing.id },
        data: { fullDays: status === 'present' ? 1 : 0, halfDays: status === 'half' ? 1 : 0 }
      })
    } else {
      att = await prisma.weeklyAttendance.create({
        data: {
          employeeId: empId,
          weekLabel: date,
          dateFrom: dateObj,
          dateTo: dateObj,
          fullDays: status === 'present' ? 1 : 0,
          halfDays: status === 'half' ? 1 : 0
        }
      })
    }
    res.json(att)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
router.post('/attendance/bulk', auth, async (req, res) => {
  try {
    const { date, attendance } = req.body
    const dateObj = new Date(date)
    const results = []
    for (const att of attendance) {
      const existing = await prisma.weeklyAttendance.findFirst({
        where: { employeeId: att.employeeId, dateFrom: dateObj }
      })
      if (existing) {
        const updated = await prisma.weeklyAttendance.update({
          where: { id: existing.id },
          data: {
            fullDays: att.status === 'present' ? 1 : 0,
            halfDays: att.status === 'half' ? 1 : 0
          }
        })
        results.push(updated)
      } else {
        const created = await prisma.weeklyAttendance.create({
          data: {
            employeeId: att.employeeId,
            weekLabel: date,
            dateFrom: dateObj,
            dateTo: dateObj,
            fullDays: att.status === 'present' ? 1 : 0,
            halfDays: att.status === 'half' ? 1 : 0
          }
        })
        results.push(created)
      }
    }
    res.json(results)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST bulk production log (save all labour entries at once)
router.post('/production/bulk', auth, async (req, res) => {
  try {
    const { date, entries } = req.body
    const results = []
    for (const entry of entries) {
      const log = await prisma.productionLog.create({
        data: {
          employeeId: entry.employeeId,
          productCode: entry.productCode,
          date: new Date(date),
          qty: parseInt(entry.qty),
          rate: parseFloat(entry.rate),
          workType: entry.workType || null
        }
      })
      results.push(log)
    }
    res.json(results)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST generate salary for ALL employees
router.post('/salary/generate-all', auth, async (req, res) => {
  try {
    const { weekLabel, dateFrom, dateTo } = req.body
    const from = new Date(dateFrom)
    const to = new Date(dateTo)
    const employees = await prisma.employee.findMany({
      include: {
        weeklyAttendance: true,
        productionLogs: true,
        advances: { where: { recovered: false, recoveryType: 'salary' } }
      }
    })
    const results = []
    for (const emp of employees) {
      let amount = 0
      if (emp.salaryType === 'DAILY') {
        const logs = emp.weeklyAttendance.filter(w => {
          const d = new Date(w.dateFrom)
          return d >= from && d <= to
        })
        amount = logs.reduce((s, w) =>
          s + (w.fullDays * emp.dailyRate) + (w.halfDays * emp.dailyRate / 2), 0)
      } else {
        const logs = emp.productionLogs.filter(l => {
          const d = new Date(l.date)
          return d >= from && d <= to
        })
        amount = logs.reduce((s, l) => s + (l.qty * l.rate), 0)
      }
      if (amount === 0) continue
      const advanceDeduction = emp.advances.reduce((s, a) => s + a.remainingAmount, 0)
      const netAmount = Math.max(0, amount - advanceDeduction)
      const salary = await prisma.salaryRecord.create({
        data: {
          employeeId: emp.id,
          week: weekLabel,
          amount: netAmount,
          paidAmount: 0,
          advanceDeducted: advanceDeduction
        }
      })
      if (advanceDeduction > 0) {
        await prisma.employeeAdvance.updateMany({
          where: { employeeId: emp.id, recovered: false, recoveryType: 'salary' },
          data: { recovered: true, remainingAmount: 0 }
        })
      }
      results.push({ ...salary, empName: emp.name, grossAmount: amount, advanceDeducted: advanceDeduction })
    }
    res.json(results)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
module.exports = router