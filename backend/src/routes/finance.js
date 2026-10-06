const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')
const auth = require('../middleware/auth')

// GET all income
router.get('/income', auth, async (req, res) => {
  try {
    const income = await prisma.income.findMany({ orderBy: { date: 'desc' } })
    res.json(income)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST add income
router.post('/income', auth, async (req, res) => {
  try {
    const { category, description, amount, date } = req.body
    const income = await prisma.income.create({
      data: {
        category,
        description,
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date()
      }
    })
    res.json(income)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
// GET all expenses
router.get('/expenses', auth, async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({ orderBy: { date: 'desc' } })
    res.json(expenses)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST add expense
router.post('/expenses', auth, async (req, res) => {
  try {
    const { category, description, amount, date } = req.body
    const expense = await prisma.expense.create({
      data: {
        category,
        description,
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date()
      }
    })
    res.json(expense)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router