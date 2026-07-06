-- Migration: Create portfolio table
-- Created at: 2026-07-06

CREATE TABLE IF NOT EXISTS portfolio (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

