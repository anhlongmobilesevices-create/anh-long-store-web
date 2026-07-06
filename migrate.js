#!/usr/bin/env node

import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✓ Connected to PostgreSQL');

    const migrationsDir = path.join(__dirname, 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      console.log('⚠ No migrations directory found');
      return;
    }

    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    if (files.length === 0) {
      console.log('⚠ No migration files found');
      return;
    }

    console.log(`\nRunning ${files.length} migration(s)...\n`);

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        console.log(`⏳ Running: ${file}`);
        await client.query(sql);
        console.log(`✓ Completed: ${file}\n`);
      } catch (error) {
        console.error(`✗ Failed: ${file}`);
        console.error(`  Error: ${error.message}\n`);
        throw error;
      }
    }

    console.log('✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();

