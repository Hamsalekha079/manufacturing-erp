const express = require('express')
const { Pool } = require('pg')

const router = express.Router()

router.post('/', async (req, res) => {
  const token = process.env.CLEAR_TOKEN
  if (!token || req.get('x-clear-token') !== token) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const keepUser = req.query.keepUser !== 'false'
  const skip = keepUser ? ['_prisma_migrations', 'User'] : ['_prisma_migrations']

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  try {
    const { rows } = await pool.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND NOT (tablename = ANY($1))`,
      [skip]
    )
    const cleared = []
    for (const r of rows) {
      await pool.query(`TRUNCATE TABLE public."${r.tablename}" RESTART IDENTITY CASCADE`)
      cleared.push(r.tablename)
    }
    res.json({ ok: true, cleared })
  } catch (e) {
    res.status(500).json({ error: e.message })
  } finally {
    await pool.end()
  }
})

module.exports = router