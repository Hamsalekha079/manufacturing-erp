const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')
const auth = require('../middleware/auth')

// ─── CATEGORY ROUTES (must be before /:code routes) ─────
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
    res.json(categories)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/categories', auth, async (req, res) => {
  try {
    const category = await prisma.category.create({ data: { name: req.body.name } })
    res.json(category)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/categories/:id', auth, async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── PRODUCT ROUTES ──────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: [{ category: 'asc' }, { code: 'asc' }]
    })
    res.json(products)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', auth, async (req, res) => {
  try {
    const product = await prisma.product.create({ data: req.body })
    await prisma.semiFinishedStock.create({
      data: { productCode: product.code, stock: 0 }
    })
    await prisma.finishedStock.create({
      data: { productCode: product.code, stock: 0 }
    })
    res.json(product)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:code', auth, async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { code: req.params.code },
      data: req.body
    })
    res.json(product)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:code', auth, async (req, res) => {
  try {
    await prisma.semiFinishedStock.deleteMany({ where: { productCode: req.params.code } })
    await prisma.finishedStock.deleteMany({ where: { productCode: req.params.code } })
    await prisma.product.delete({ where: { code: req.params.code } })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router