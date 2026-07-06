#!/usr/bin/env node

import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function initDatabase() {
  try {
    await client.connect();
    console.log('✓ Connected to PostgreSQL');

    // Create portfolio table
    console.log('Creating portfolio table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS portfolio (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        description TEXT,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Portfolio table created');

    // Insert sample data
    console.log('Inserting sample portfolio items...');
    await client.query(`
      INSERT INTO portfolio (title, description, category) VALUES
      (
        'iPhone 15 Pro Max Screen Repair',
        'Successfully repaired a cracked OLED display on iPhone 15 Pro Max. Replaced with genuine Apple parts and tested all functionality including Face ID and True Tone.',
        'Screen Repair'
      ),
      (
        'Samsung Galaxy S24 Battery Replacement',
        'Complete battery replacement for Samsung Galaxy S24. Removed old battery safely and installed new OEM battery with full capacity restoration. Device now holds charge for 24+ hours.',
        'Battery Service'
      ),
      (
        'MacBook Pro Logic Board Repair',
        'Diagnosed and repaired a faulty logic board on MacBook Pro 16-inch. Replaced damaged capacitors and tested all ports and functions. Device fully operational.',
        'Computer Repair'
      ),
      (
        'iPad Air Charging Port Replacement',
        'Replaced damaged USB-C charging port on iPad Air. Micro-soldering work completed with precision. Device charges normally and data transfer works perfectly.',
        'Port Repair'
      )
      ON CONFLICT DO NOTHING;
    `);
    console.log('✓ Sample data inserted');

    // Verify data
    const result = await client.query('SELECT COUNT(*) as count FROM portfolio;');
    console.log(`✓ Portfolio table has ${result.rows[0].count} items`);

    console.log('\n✅ Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initDatabase();

