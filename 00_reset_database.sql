-- WARNING: This script will drop all tables and data - use only in development

-- Drop tables in reverse order of creation (to avoid foreign key constraints)
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS scraping_jobs;
DROP TABLE IF EXISTS scraper_configs;
DROP TABLE IF EXISTS dealers;
DROP TABLE IF EXISTS users;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column(); 