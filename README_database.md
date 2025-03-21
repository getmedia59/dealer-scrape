# Database Setup Instructions

This document provides instructions for setting up the database for the Vehicle Marketplace Scraping Service using Supabase.

## Prerequisites

1. A Supabase account and project
2. Access to the Supabase SQL Editor

## Setup Instructions

1. **Create a New Supabase Project**
   - Go to [Supabase](https://supabase.com/) and create a new project if you haven't already.

2. **Run the SQL Scripts**
   - Run the SQL scripts in the following order through the Supabase SQL Editor:
     1. `01_extensions.sql` - Sets up necessary PostgreSQL extensions
     2. `02_users_table.sql` - Creates the users table
     3. `03_dealers_table.sql` - Creates the dealers table
     4. `04_scraper_configs_table.sql` - Creates the scraper configurations table
     5. `05_scraping_jobs_table.sql` - Creates the scraping jobs table
     6. `06_vehicles_table.sql` - Creates the vehicles table

   **Note**: If you're using Supabase Auth, you might want to modify the users table to match your auth setup.

3. **Environment Variables**
   - After setting up the database, update your `.env.local` file with the Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
   SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
   ```

## Database Schema

The database consists of the following tables:

1. **users** - Stores user information
2. **dealers** - Stores information about car dealers
3. **scraper_configs** - Stores scraper configurations for different dealer websites
4. **scraping_jobs** - Tracks scraping job executions
5. **vehicles** - Stores vehicle data scraped from dealer websites

## Row Level Security

All tables have Row Level Security (RLS) policies enabled to ensure data security:

- Users can only access their own data
- Admin users have access to all data
- Regular users can only modify data they created

## Development Reset

For development purposes, you can use the `00_reset_database.sql` script to reset the database. 
**WARNING**: This will delete all data. Do not use in production. 