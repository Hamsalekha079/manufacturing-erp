const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
require('dotenv').config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding master data...')

  // ─── SUPPLIERS ───────────────────────────────────────────
  const suppliers = [
    { name: 'Ravi Kumar', phone: '9876543210', paymentMode: 'POSTPAID' },
    { name: 'Suresh Babu', phone: '9876543211', paymentMode: 'PREPAID' },
    { name: 'Mahesh Reddy', phone: '9876543212', paymentMode: 'POSTPAID' },
    { name: 'Venkat Rao', phone: '9876543213', paymentMode: 'PREPAID' },
  ]

  for (const s of suppliers) {
    await prisma.supplier.create({ data: s })
  }
  console.log('✅ Suppliers created')

  // ─── CASTING CENTERS ─────────────────────────────────────
  const centers = [
    { name: 'Bhaskar', phone: '9876541111' },
    { name: 'Gangadharam', phone: '9876542222' },
    { name: 'Subbu', phone: '9876543333' },
  ]

  for (const c of centers) {
    await prisma.castingCenter.create({ data: c })
  }
  console.log('✅ Casting centers created')

  console.log('🎉 Done!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })