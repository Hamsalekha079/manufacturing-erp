require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

// Routes
const authRoutes = require('./routes/auth')
const productRoutes = require('./routes/products')
const employeeRoutes = require('./routes/employees')
const customerRoutes = require('./routes/customers')
const stockRoutes = require('./routes/stock')
const financeRoutes = require('./routes/finance')
const materialRoutes = require('./routes/materials')

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/stock', stockRoutes)
app.use('/api/finance', financeRoutes)
app.use('/api/materials', materialRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API HEALTHY' })
})

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})