const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')
const auth = require('../middleware/auth')

// GET all stock
router.get('/', auth, async (req, res) => {
  try {
    const semi = await prisma.semiFinishedStock.findMany({
      include: { product: true }
    })
    const finished = await prisma.finishedStock.findMany({
      include: { product: true }
    })
    res.json({ semi, finished })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH adjust stock
router.patch('/adjust', auth, async (req, res) => {
  try {
    const { type, productCode, adjustType, qty } = req.body
    const model = type === 'semi' ? prisma.semiFinishedStock : prisma.finishedStock
    const current = await model.findUnique({ where: { productCode } })
    if (!current) return res.status(404).json({ error: 'Stock not found' })
    const newStock = adjustType === 'add'
      ? current.stock + qty
      : Math.max(0, current.stock - qty)
    const updated = await model.update({
      where: { productCode },
      data: { stock: newStock }
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH mark as finished (semi → finished)
router.patch('/mark-finished', auth, async (req, res) => {
  try {
    const { productCode, qty } = req.body
    await prisma.semiFinishedStock.update({
      where: { productCode },
      data: { stock: { decrement: qty } }
    })
    await prisma.finishedStock.update({
      where: { productCode },
      data: { stock: { increment: qty } }
    })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router