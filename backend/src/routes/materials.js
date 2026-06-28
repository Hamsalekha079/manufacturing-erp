const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')
const auth = require('../middleware/auth')

// GET suppliers
router.get('/suppliers', auth, async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: { purchases: { orderBy: { date: 'desc' } } }
    })
    res.json(suppliers)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST add purchase
router.post('/purchases', auth, async (req, res) => {
  try {
    const { supplierId, materialType, orderedKg, receivedKg, pricePerKg, date } = req.body
    const purchase = await prisma.rawMaterialPurchase.create({
      data: {
        supplierId: parseInt(supplierId),
        materialType,
        orderedKg: parseFloat(orderedKg),
        receivedKg: parseFloat(receivedKg),
        pricePerKg: parseFloat(pricePerKg),
        totalAmount: parseFloat(receivedKg) * parseFloat(pricePerKg),
        date: date ? new Date(date) : new Date()
      }
    })
    res.json(purchase)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET casting centers
router.get('/casting', auth, async (req, res) => {
  try {
    const centers = await prisma.castingCenter.findMany({
      include: { castingEntries: { orderBy: { date: 'desc' } } }
    })
    res.json(centers)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST add casting entry
router.post('/casting', auth, async (req, res) => {
  try {
    const { centerId, type, sentKg, returnedKg, ratePerKg, date } = req.body
    const sent = parseFloat(sentKg)
    const returned = parseFloat(returnedKg || 0)
    const entry = await prisma.castingEntry.create({
      data: {
        centerId: parseInt(centerId),
        type: type || 'ROUND1',
        sentKg: sent,
        returnedKg: returned,
        pendingKg: Math.max(0, sent - returned),
        extraKg: Math.max(0, returned - sent),
        ratePerKg: parseFloat(ratePerKg),
        totalAmount: sent * parseFloat(ratePerKg),
        date: date ? new Date(date) : new Date()
      }
    })
    res.json(entry)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET production runs
router.get('/production', auth, async (req, res) => {
  try {
    const runs = await prisma.productionRun.findMany({
      orderBy: { date: 'desc' }
    })
    res.json(runs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST add production run
router.post('/production', auth, async (req, res) => {
  try {
    const run = await prisma.productionRun.create({ data: req.body })
    res.json(run)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router