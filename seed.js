#!/usr/bin/env node

import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

async function seedDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✓ Connected to PostgreSQL');

    console.log('\n⏳ Seeding portfolio table...');
    
    const result = await client.query(`
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
      ON CONFLICT DO NOTHING
      RETURNING id;
    `);

    console.log(`✓ Inserted ${result.rows.length} portfolio items`);

    // Verify data
    const countResult = await client.query('SELECT COUNT(*) as count FROM portfolio;');
    console.log(`✓ Portfolio table now has ${countResult.rows[0].count} items\n`);

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedDatabase();

