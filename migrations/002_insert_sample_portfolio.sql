-- Migration: Insert sample portfolio items
-- Created at: 2026-07-06

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
);

