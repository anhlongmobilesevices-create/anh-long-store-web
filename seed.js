import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

// Sample portfolio data - 484 items covering various phone repair services
const portfolioData = [
  // iPhone Screen Repairs (100 items)
  ...Array.from({ length: 100 }, (_, i) => ({
    title: `iPhone Screen Repair #${i + 1}`,
    description: `Professional iPhone screen replacement service. Genuine parts, warranty included.`,
    category: 'Thay Màn Hình iPhone'
  })),
  
  // iPad Repairs (80 items)
  ...Array.from({ length: 80 }, (_, i) => ({
    title: `iPad Repair #${i + 1}`,
    description: `iPad screen, battery, and component replacement services.`,
    category: 'Sửa Chữa iPad'
  })),
  
  // MacBook Repairs (80 items)
  ...Array.from({ length: 80 }, (_, i) => ({
    title: `MacBook Repair #${i + 1}`,
    description: `MacBook screen, keyboard, battery, and logic board repairs.`,
    category: 'Sửa Chữa MacBook'
  })),
  
  // Android Phone Repairs (100 items)
  ...Array.from({ length: 100 }, (_, i) => ({
    title: `Android Phone Repair #${i + 1}`,
    description: `Samsung, Xiaomi, Oppo, Vivo phone repairs and screen replacement.`,
    category: 'Sửa Chữa Điện Thoại Android'
  })),
  
  // Battery Replacement (50 items)
  ...Array.from({ length: 50 }, (_, i) => ({
    title: `Battery Replacement #${i + 1}`,
    description: `Phone battery replacement service with warranty.`,
    category: 'Thay Pin Điện Thoại'
  })),
  
  // Charging Port Repair (40 items)
  ...Array.from({ length: 40 }, (_, i) => ({
    title: `Charging Port Repair #${i + 1}`,
    description: `Charging port repair and replacement for all phone models.`,
    category: 'Sửa Cổng Sạc'
  })),
  
  // Water Damage Repair (34 items)
  ...Array.from({ length: 34 }, (_, i) => ({
    title: `Water Damage Repair #${i + 1}`,
    description: `Professional water damage restoration and component replacement.`,
    category: 'Sửa Chữa Nước'
  }))
]

async function seed() {
  try {
    console.log(`🌱 Seeding ${portfolioData.length} portfolio items...`)
    
    // Check if data already exists
    const checkResult = await pool.query('SELECT COUNT(*) FROM portfolio')
    const existingCount = parseInt(checkResult.rows[0].count)
    
    if (existingCount > 0) {
      console.log(`⚠️  Portfolio already has ${existingCount} items. Skipping seed.`)
      process.exit(0)
    }
    
    // Insert data in batches
    const batchSize = 50
    for (let i = 0; i < portfolioData.length; i += batchSize) {
      const batch = portfolioData.slice(i, i + batchSize)
      
      for (const item of batch) {
        await pool.query(
          'INSERT INTO portfolio (title, description, category) VALUES ($1, $2, $3)',
          [item.title, item.description, item.category]
        )
      }
      
      console.log(`✅ Inserted ${Math.min(i + batchSize, portfolioData.length)}/${portfolioData.length}`)
    }
    
    console.log(`✅ Successfully seeded ${portfolioData.length} portfolio items`)
    
    // Show summary
    const result = await pool.query('SELECT category, COUNT(*) FROM portfolio GROUP BY category ORDER BY category')
    console.log('\n📊 Portfolio Summary:')
    result.rows.forEach(row => {
      console.log(`  - ${row.category}: ${row.count} items`)
    })
    
    process.exit(0)
  } catch (err) {
    console.error('❌ Seed failed:', err.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

seed()
