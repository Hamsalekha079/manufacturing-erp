require('dotenv').config()
const { Client } = require('pg')

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  const { rows } = await client.query(
    `SELECT tablename FROM pg_tables
     WHERE schemaname = 'public'
     AND tablename NOT IN ('_prisma_migrations', 'User')`
  )
  for (const r of rows) {
    await client.query(`TRUNCATE TABLE public."${r.tablename}" RESTART IDENTITY CASCADE`)
    console.log('cleared', r.tablename)
  }
  await client.end()
}
main().catch(e => { console.error(e); process.exit(1) })