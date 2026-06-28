const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')
const auth = require('../middleware/auth')

// GET all customers
router.get('/', auth, async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        orders: {
          include: {
            items: true,
            payments: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })
    res.json(customers)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST add customer
router.post('/', auth, async (req, res) => {
  try {
    const customer = await prisma.customer.create({ data: req.body })
    res.json(customer)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST add order
router.post('/:id/orders', auth, async (req, res) => {
  try {
    const { items, dueDate, date } = req.body
    const totalAmount = items.reduce((s, i) => s + (i.qty * i.price), 0)
    const order = await prisma.order.create({
      data: {
        customerId: parseInt(req.params.id),
        date: date ? new Date(date) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        totalAmount,
        items: { create: items.map(i => ({
          productCode: i.code,
          name: i.name,
          qty: i.qty,
          price: i.price
        })) }
      },
      include: { items: true, payments: true }
    })
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH mark delivered
router.patch('/:customerId/orders/:orderId/deliver', auth, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.orderId) },
      include: { items: true }
    })
    if (order.deliveryStatus === 'pending') {
      for (const item of order.items) {
        await prisma.finishedStock.update({
          where: { productCode: item.productCode },
          data: { stock: { decrement: item.qty } }
        })
      }
    }
    const updated = await prisma.order.update({
      where: { id: parseInt(req.params.orderId) },
      data: { deliveryStatus: 'delivered' }
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST record payment
router.post('/:customerId/orders/:orderId/payment', auth, async (req, res) => {
  try {
    const { amount, method } = req.body
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(req.params.customerId) }
    })
    const payment = await prisma.payment.create({
      data: {
        orderId: parseInt(req.params.orderId),
        amount,
        method,
        date: new Date()
      }
    })
    await prisma.income.create({
      data: {
        category: 'Sale',
        description: `Payment - ${customer.name}`,
        amount,
        date: new Date()
      }
    })
    res.json(payment)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET walkin sales
router.get('/walkin', auth, async (req, res) => {
  try {
    const sales = await prisma.walkinSale.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    })
    res.json(sales)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST add walkin sale
router.post('/walkin', auth, async (req, res) => {
  try {
    const { name, phone, method, amount, date, items } = req.body
    const sale = await prisma.walkinSale.create({
      data: {
        name, phone, method, amount,
        date: date ? new Date(date) : new Date(),
        items: { create: items.map(i => ({
          productCode: i.code,
          name: i.name,
          qty: i.qty,
          price: i.price
        })) }
      },
      include: { items: true }
    })
    for (const item of items) {
      await prisma.finishedStock.update({
        where: { productCode: item.code },
        data: { stock: { decrement: item.qty } }
      })
    }
    await prisma.income.create({
      data: {
        category: 'Sale',
        description: `Walk-in sale - ${name}`,
        amount,
        date: date ? new Date(date) : new Date()
      }
    })
    res.json(sale)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router