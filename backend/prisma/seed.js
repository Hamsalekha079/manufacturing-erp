const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // ─── USER ────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
      phone: '9876543210',
      role: 'ADMIN',
    }
  })
  console.log('✅ User created')

  // ─── PRODUCTS ────────────────────────────────────────────
  const products = [
    { code: 'Sd 30', name: 'Kalash Standard', size: '30', category: 'Kalash - Standard', bulkPrice: 350, retailPrice: 420, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'Sd 50', name: 'Kalash Standard', size: '50', category: 'Kalash - Standard', bulkPrice: 380, retailPrice: 450, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'Sd 70', name: 'Kalash Standard', size: '70', category: 'Kalash - Standard', bulkPrice: 420, retailPrice: 500, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'Sd 100', name: 'Kalash Standard', size: '100', category: 'Kalash - Standard', bulkPrice: 450, retailPrice: 540, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'Sd 150', name: 'Kalash Standard', size: '150', category: 'Kalash - Standard', bulkPrice: 520, retailPrice: 620, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'Sd 200', name: 'Kalash Standard', size: '200', category: 'Kalash - Standard', bulkPrice: 580, retailPrice: 700, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'Sd 250', name: 'Kalash Standard', size: '250', category: 'Kalash - Standard', bulkPrice: 650, retailPrice: 780, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'LW 50', name: 'Kalash Light Weight', size: '50', category: 'Kalash - Light Weight', bulkPrice: 320, retailPrice: 380, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'LW 70', name: 'Kalash Light Weight', size: '70', category: 'Kalash - Light Weight', bulkPrice: 360, retailPrice: 430, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'LW 100', name: 'Kalash Light Weight', size: '100', category: 'Kalash - Light Weight', bulkPrice: 400, retailPrice: 480, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'LW 150', name: 'Kalash Light Weight', size: '150', category: 'Kalash - Light Weight', bulkPrice: 460, retailPrice: 550, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'LW 200', name: 'Kalash Light Weight', size: '200', category: 'Kalash - Light Weight', bulkPrice: 520, retailPrice: 620, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'LW 250', name: 'Kalash Light Weight', size: '250', category: 'Kalash - Light Weight', bulkPrice: 580, retailPrice: 700, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'AL 100', name: 'Kalash Asta Lakshmi', size: '100', category: 'Kalash - Asta Lakshmi', bulkPrice: 750, retailPrice: 900, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'AL 150', name: 'Kalash Asta Lakshmi', size: '150', category: 'Kalash - Asta Lakshmi', bulkPrice: 800, retailPrice: 960, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'AL 200', name: 'Kalash Asta Lakshmi', size: '200', category: 'Kalash - Asta Lakshmi', bulkPrice: 850, retailPrice: 1020, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'AL 250', name: 'Kalash Asta Lakshmi', size: '250', category: 'Kalash - Asta Lakshmi', bulkPrice: 900, retailPrice: 1080, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'BPP-S', name: 'Panchapatra', size: 'Small', category: 'Panchapatra', bulkPrice: 220, retailPrice: 260, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'BPP-M', name: 'Panchapatra', size: 'Medium', category: 'Panchapatra', bulkPrice: 280, retailPrice: 330, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'BPP-B', name: 'Panchapatra', size: 'Large', category: 'Panchapatra', bulkPrice: 340, retailPrice: 400, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'GL-M', name: 'Glass', size: 'Medium', category: 'Glass', bulkPrice: 180, retailPrice: 220, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'GL-L', name: 'Glass', size: 'Large', category: 'Glass', bulkPrice: 220, retailPrice: 260, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'BPL-1', name: 'Plate', size: '1', category: 'Plate', bulkPrice: 120, retailPrice: 150, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'BPL-2', name: 'Plate', size: '2', category: 'Plate', bulkPrice: 140, retailPrice: 170, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'BPL-3', name: 'Plate', size: '3', category: 'Plate', bulkPrice: 160, retailPrice: 190, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'BPL-4', name: 'Plate', size: '4', category: 'Plate', bulkPrice: 180, retailPrice: 220, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'BPL-5', name: 'Plate', size: '5', category: 'Plate', bulkPrice: 200, retailPrice: 240, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'Ud-S', name: 'Spoon', size: 'Small', category: 'Spoon', bulkPrice: 180, retailPrice: 220, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'Ud-B', name: 'Spoon', size: 'Big', category: 'Spoon', bulkPrice: 220, retailPrice: 260, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'KK-S', name: 'Kubera Kuncham', size: 'Small', category: 'Kubera Kuncham', bulkPrice: 260, retailPrice: 320, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'KK-M', name: 'Kubera Kuncham', size: 'Medium', category: 'Kubera Kuncham', bulkPrice: 320, retailPrice: 380, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
    { code: 'KK-B', name: 'Kubera Kuncham', size: 'Large', category: 'Kubera Kuncham', bulkPrice: 380, retailPrice: 450, shapingRate: 8, finishingRate: 8, polishingRate: 4 },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where: { code: p.code },
      update: p,
      create: p,
    })
  }
  console.log('✅ Products seeded')

  // ─── STOCK ───────────────────────────────────────────────
  const stockData = [
    { code: 'Sd 30', semi: 20, finished: 45 },
    { code: 'Sd 50', semi: 15, finished: 30 },
    { code: 'Sd 70', semi: 8, finished: 12 },
    { code: 'Sd 100', semi: 5, finished: 8 },
    { code: 'Sd 150', semi: 6, finished: 15 },
    { code: 'Sd 200', semi: 3, finished: 6 },
    { code: 'Sd 250', semi: 2, finished: 4 },
    { code: 'LW 50', semi: 10, finished: 18 },
    { code: 'LW 70', semi: 8, finished: 22 },
    { code: 'LW 100', semi: 5, finished: 10 },
    { code: 'LW 150', semi: 3, finished: 5 },
    { code: 'LW 200', semi: 4, finished: 8 },
    { code: 'LW 250', semi: 2, finished: 3 },
    { code: 'AL 100', semi: 6, finished: 12 },
    { code: 'AL 150', semi: 4, finished: 9 },
    { code: 'AL 200', semi: 3, finished: 7 },
    { code: 'AL 250', semi: 2, finished: 4 },
    { code: 'BPP-S', semi: 12, finished: 25 },
    { code: 'BPP-M', semi: 8, finished: 18 },
    { code: 'BPP-B', semi: 6, finished: 17 },
    { code: 'GL-M', semi: 4, finished: 5 },
    { code: 'GL-L', semi: 3, finished: 3 },
    { code: 'BPL-1', semi: 10, finished: 20 },
    { code: 'BPL-2', semi: 8, finished: 18 },
    { code: 'BPL-3', semi: 6, finished: 15 },
    { code: 'BPL-4', semi: 5, finished: 12 },
    { code: 'BPL-5', semi: 4, finished: 10 },
    { code: 'Ud-S', semi: 6, finished: 12 },
    { code: 'Ud-B', semi: 5, finished: 12 },
    { code: 'KK-S', semi: 8, finished: 18 },
    { code: 'KK-M', semi: 6, finished: 15 },
    { code: 'KK-B', semi: 4, finished: 12 },
  ]

  for (const s of stockData) {
    await prisma.semiFinishedStock.upsert({
      where: { productCode: s.code },
      update: { stock: s.semi },
      create: { productCode: s.code, stock: s.semi },
    })
    await prisma.finishedStock.upsert({
      where: { productCode: s.code },
      update: { stock: s.finished },
      create: { productCode: s.code, stock: s.finished },
    })
  }
  console.log('✅ Stock seeded')

  // ─── SUPPLIERS ───────────────────────────────────────────
  const suppliers = [
    { name: 'Ravi Kumar', phone: '9876543210', paymentMode: 'POSTPAID' },
    { name: 'Suresh Babu', phone: '9876543211', paymentMode: 'PREPAID' },
    { name: 'Mahesh Reddy', phone: '9876543212', paymentMode: 'POSTPAID' },
    { name: 'Venkat Rao', phone: '9876543213', paymentMode: 'PREPAID' },
  ]
  for (const s of suppliers) {
    await prisma.supplier.upsert({
      where: { id: suppliers.indexOf(s) + 1 },
      update: {},
      create: s,
    })
  }
  console.log('✅ Suppliers seeded')

  // ─── CASTING CENTERS ─────────────────────────────────────
  const centers = [
    { name: 'Bhaskar', phone: '9876541111' },
    { name: 'Gangadharam', phone: '9876542222' },
    { name: 'Subbu', phone: '9876543333' },
  ]
  for (const c of centers) {
    await prisma.castingCenter.upsert({
      where: { id: centers.indexOf(c) + 1 },
      update: {},
      create: c,
    })
  }
  console.log('✅ Casting centers seeded')

  // ─── EMPLOYEES ───────────────────────────────────────────
  const emp1 = await prisma.employee.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Krishna Rao', phone: '9876540001', role: 'Operator', salaryType: 'DAILY', dailyRate: 600 }
  })
  const emp2 = await prisma.employee.upsert({
    where: { id: 2 },
    update: {},
    create: { name: 'Srinivas', phone: '9876540002', role: 'Operator', salaryType: 'DAILY', dailyRate: 550 }
  })
  const emp3 = await prisma.employee.upsert({
    where: { id: 3 },
    update: {},
    create: { name: 'Ramesh', phone: '9876540003', role: 'Worker', salaryType: 'LABOUR', dailyRate: 0 }
  })
  const emp4 = await prisma.employee.upsert({
    where: { id: 4 },
    update: {},
    create: { name: 'Suresh', phone: '9876540004', role: 'Worker', salaryType: 'LABOUR', dailyRate: 0 }
  })
  const emp5 = await prisma.employee.upsert({
    where: { id: 5 },
    update: {},
    create: { name: 'Naresh', phone: '9876540005', role: 'Helper', salaryType: 'DAILY', dailyRate: 450 }
  })
  console.log('✅ Employees seeded')

  // ─── CUSTOMERS ───────────────────────────────────────────
  await prisma.customer.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Sri Lakshmi Stores', location: 'Vijayawada', locationType: 'non-local', phone: '9876541234' }
  })
  await prisma.customer.upsert({
    where: { id: 2 },
    update: {},
    create: { name: 'Ganesh Traders', location: 'Guntur', locationType: 'non-local', phone: '9876541236' }
  })
  await prisma.customer.upsert({
    where: { id: 3 },
    update: {},
    create: { name: 'Venkateswara Stores', location: 'Tenali', locationType: 'non-local', phone: '9876541237' }
  })
  await prisma.customer.upsert({
    where: { id: 4 },
    update: {},
    create: { name: 'Balaji Agencies', location: 'Eluru', locationType: 'non-local', phone: '9876541238' }
  })
  await prisma.customer.upsert({
    where: { id: 5 },
    update: {},
    create: { name: 'Durga Traders', location: 'Tirupati', locationType: 'local', phone: '9876541239' }
  })
  console.log('✅ Customers seeded')

  console.log('🎉 Seeding complete!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })