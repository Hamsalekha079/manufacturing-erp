const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')
const auth = require('../middleware/auth')

// GET suppliers
// GET suppliers
// GET supplier purchases with payment history
router.get('/suppliers', auth, async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        purchases: {
          include: { payments: { orderBy: { date: 'desc' } } },
          orderBy: { date: 'desc' }
        }
      }
    })
    res.json(suppliers)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
// POST add supplier
router.post('/suppliers', auth, async (req, res) => {
  try {
    const supplier = await prisma.supplier.create({ data: req.body })
    res.json(supplier)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST record material payment
router.post('/purchases/:id/payment', auth, async (req, res) => {
  try {
    const { amount, date, note } = req.body
    const purchaseId = parseInt(req.params.id)

    // Create payment record
    const payment = await prisma.materialPayment.create({
      data: {
        purchaseId,
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date(),
        note: note || null
      }
    })

    // Update paidAmount on purchase
    await prisma.rawMaterialPurchase.update({
      where: { id: purchaseId },
      data: { paidAmount: { increment: parseFloat(amount) } }
    })

    // Add to expenses
    const purchase = await prisma.rawMaterialPurchase.findUnique({
      where: { id: purchaseId },
      include: { supplier: true }
    })
    await prisma.expense.create({
      data: {
        category: 'Material',
        description: `Payment - ${purchase.supplier.name}`,
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date()
      }
    })

    res.json(payment)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH update received kg (for pending delivery)
router.patch('/purchases/:id/receive', auth, async (req, res) => {
  try {
    const { additionalKg } = req.body
    const existing = await prisma.rawMaterialPurchase.findUnique({
      where: { id: parseInt(req.params.id) }
    })
    const newReceivedKg = existing.receivedKg + parseFloat(additionalKg)
    // totalAmount stays same — based on orderedKg
    const purchase = await prisma.rawMaterialPurchase.update({
      where: { id: parseInt(req.params.id) },
      data: { receivedKg: newReceivedKg }
    })
    res.json(purchase)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
// POST add purchase
router.post('/purchases', auth, async (req, res) => {
  try {
    const { supplierId, materialType, orderedKg, receivedKg, pricePerKg, totalAmount, paidAmount, date ,initialPaymentNote  } = req.body
    const purchase = await prisma.rawMaterialPurchase.create({
      data: {
        supplierId: parseInt(supplierId),
        materialType,
        orderedKg: parseFloat(orderedKg),
        receivedKg: parseFloat(receivedKg),
        pricePerKg: parseFloat(pricePerKg),
        totalAmount: parseFloat(totalAmount),
        paidAmount: parseFloat(paidAmount || 0),
        date: date ? new Date(date) : new Date()
      }
    })
    // If initial payment was made, create payment history record
    if (paidAmount && parseFloat(paidAmount) > 0) {
     await prisma.materialPayment.create({
  data: {
    purchaseId: purchase.id,
    amount: parseFloat(paidAmount),
    date: date ? new Date(date) : new Date(),
    note: initialPaymentNote || 'Initial payment'
  }
})
      await prisma.expense.create({
        data: {
          category: 'Material',
          description: `Initial payment - supplier purchase #${purchase.id}`,
          amount: parseFloat(paidAmount),
          date: date ? new Date(date) : new Date()
        }
      })
    }
    res.json(purchase)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
// GET casting centers
// GET casting with payment history
router.get('/casting', auth, async (req, res) => {
  try {
    const centers = await prisma.castingCenter.findMany({
      include: {
        castingEntries: {
          include: { payments: { orderBy: { date: 'desc' } } },
          orderBy: { date: 'desc' }
        }
      }
    })
    res.json(centers)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST add casting entry
// POST add casting entry
router.post('/casting', auth, async (req, res) => {
  try {
    const { centerId, type, sentKg, returnedKg, ratePerKg, totalAmount, paidAmount, date ,initialPaymentNote  } = req.body
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
        totalAmount: parseFloat(totalAmount) || sent * parseFloat(ratePerKg),
        paidAmount: parseFloat(paidAmount || 0),
        date: date ? new Date(date) : new Date()
      }
    })
    // If initial payment was made, create payment history record
    if (paidAmount && parseFloat(paidAmount) > 0) {
     await prisma.castingPayment.create({
  data: {
    entryId: entry.id,
    amount: parseFloat(paidAmount),
    date: date ? new Date(date) : new Date(),
    note: initialPaymentNote || 'Initial payment'
  }
})
      await prisma.expense.create({
        data: {
          category: 'Casting',
          description: `Initial casting payment #${entry.id}`,
          amount: parseFloat(paidAmount),
          date: date ? new Date(date) : new Date()
        }
      })
    }
    res.json(entry)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
// POST add casting center
router.post('/casting-centers', auth, async (req, res) => {
  try {
    const center = await prisma.castingCenter.create({ data: req.body })
    res.json(center)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST record casting payment
router.post('/casting/:id/payment', auth, async (req, res) => {
  try {
    const { amount, date, note } = req.body
    const entryId = parseInt(req.params.id)

    const payment = await prisma.castingPayment.create({
      data: {
        entryId,
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date(),
        note: note || null
      }
    })

    await prisma.castingEntry.update({
      where: { id: entryId },
      data: { paidAmount: { increment: parseFloat(amount) } }
    })

    await prisma.expense.create({
      data: {
        category: 'Casting',
        description: `Casting payment #${entryId}`,
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date()
      }
    })

    res.json(payment)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
// PATCH receive pending casting kg
router.patch('/casting/:id/receive', auth, async (req, res) => {
  try {
    const { additionalKg } = req.body
    const existing = await prisma.castingEntry.findUnique({
      where: { id: parseInt(req.params.id) }
    })
    const newReturnedKg = existing.returnedKg + parseFloat(additionalKg)
    const newPendingKg = Math.max(0, existing.sentKg - newReturnedKg)
    const newExtraKg = Math.max(0, newReturnedKg - existing.sentKg)
    const entry = await prisma.castingEntry.update({
      where: { id: parseInt(req.params.id) },
      data: {
        returnedKg: newReturnedKg,
        pendingKg: newPendingKg,
        extraKg: newExtraKg,
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
    const { productType, materialUsedKg, productsMade, wasteKg, date } = req.body
    const run = await prisma.productionRun.create({
      data: {
        productType,
        materialUsedKg: parseFloat(materialUsedKg),
        productsMade: parseInt(productsMade),
        wasteKg: parseFloat(wasteKg || 0),
        date: date ? new Date(date) : new Date()
      }
    })
    res.json(run)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
// POST record waste casting payment
router.post('/waste-casting/:id/payment', auth, async (req, res) => {
  try {
    const { amount, date, note } = req.body
    const entryId = parseInt(req.params.id)

    const payment = await prisma.castingPayment.create({
      data: {
        entryId,
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date(),
        note: note || null
      }
    })

    await prisma.castingEntry.update({
      where: { id: entryId },
      data: { paidAmount: { increment: parseFloat(amount) } }
    })

    await prisma.expense.create({
      data: {
        category: 'Casting',
        description: `Waste casting payment #${entryId}`,
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date()
      }
    })

    res.json(payment)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH receive pending waste casting
router.patch('/waste-casting/:id/receive', auth, async (req, res) => {
  try {
    const { additionalKg } = req.body
    const existing = await prisma.castingEntry.findUnique({
      where: { id: parseInt(req.params.id) }
    })
    const newReturnedKg = existing.returnedKg + parseFloat(additionalKg)
    const newPendingKg = Math.max(0, existing.sentKg - newReturnedKg)
    const newExtraKg = Math.max(0, newReturnedKg - existing.sentKg)
    const entry = await prisma.castingEntry.update({
      where: { id: parseInt(req.params.id) },
      data: { returnedKg: newReturnedKg, pendingKg: newPendingKg, extraKg: newExtraKg }
    })
    res.json(entry)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
module.exports = router