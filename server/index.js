import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
import pkg from 'pg'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

dotenv.config()

const { Pool } = pkg
const app = express()
const PORT = process.env.PORT || 3001

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Middleware
app.use(cors())
app.use(express.json())

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Admin credentials (hardcoded for now)
const ADMIN_EMAIL = 'admin@anhlongmobile.com'
const ADMIN_PASSWORD_HASH = bcryptjs.hashSync('admin123', 10)

// Run migrations on startup
async function runMigrations() {
  try {
    const client = await pool.connect()
    console.log('Running database migrations...')

    const migrationsDir = path.join(__dirname, '../migrations')
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir).sort()

      for (const file of files) {
        if (file.endsWith('.sql')) {
          const filePath = path.join(migrationsDir, file)
          const sql = fs.readFileSync(filePath, 'utf8')
          
          console.log(`Running migration: ${file}`)
          await client.query(sql)
          console.log(`✓ Completed: ${file}`)
        }
      }
    }

    client.release()
    console.log('All migrations completed successfully')
  } catch (error) {
    console.error('Migration error:', error)
    process.exit(1)
  }
}

// Routes
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (email === ADMIN_EMAIL && bcryptjs.compareSync(password, ADMIN_PASSWORD_HASH)) {
      const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' })
      return res.json({
        token,
        user: { email, role: 'admin' }
      })
    }

    res.status(401).json({ error: 'Invalid credentials' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// ===== PORTFOLIO ENDPOINTS =====

// Get all portfolio items
app.get('/api/portfolio', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM portfolio ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get portfolio item by ID
app.get('/api/portfolio/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM portfolio WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Create portfolio item
app.post('/api/portfolio', verifyToken, async (req, res) => {
  try {
    const { title, description, category } = req.body
    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    const result = await pool.query(
      'INSERT INTO portfolio (title, description, category) VALUES ($1, $2, $3) RETURNING *',
      [title, description, category]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Update portfolio item
app.put('/api/portfolio/:id', verifyToken, async (req, res) => {
  try {
    const { title, description, category } = req.body
    const result = await pool.query(
      'UPDATE portfolio SET title = $1, description = $2, category = $3 WHERE id = $4 RETURNING *',
      [title, description, category, req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete portfolio item
app.delete('/api/portfolio/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM portfolio WHERE id = $1 RETURNING *', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ===== ADDITIONAL ENDPOINTS =====

// Get portfolio by category
app.get('/api/portfolio/category/:category', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM portfolio WHERE category = $1 ORDER BY created_at DESC',
      [req.params.category]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get portfolio statistics
app.get('/api/portfolio/stats/overview', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_items,
        COUNT(DISTINCT category) as total_categories,
        MAX(created_at) as latest_item
      FROM portfolio
    `)
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Search portfolio
app.get('/api/portfolio/search/:query', async (req, res) => {
  try {
    const searchQuery = `%${req.params.query}%`
    const result = await pool.query(
      'SELECT * FROM portfolio WHERE title ILIKE $1 OR description ILIKE $1 ORDER BY created_at DESC',
      [searchQuery]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start server
async function start() {
  try {
    await runMigrations()
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()

