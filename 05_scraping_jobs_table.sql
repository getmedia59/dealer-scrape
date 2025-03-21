-- Scraping Jobs Table
CREATE TABLE IF NOT EXISTS scraping_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id UUID NOT NULL REFERENCES scraper_configs(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed')) DEFAULT 'pending',
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  result_stats JSONB DEFAULT '{}',
  error_details JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_config_id ON scraping_jobs(config_id);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_scheduled_at ON scraping_jobs(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_created_by ON scraping_jobs(created_by);

-- Row Level Security Policies
ALTER TABLE scraping_jobs ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read
CREATE POLICY scraping_jobs_select_policy ON scraping_jobs
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Users can insert
CREATE POLICY scraping_jobs_insert_policy ON scraping_jobs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Users can update only what they created, admins can update all
CREATE POLICY scraping_jobs_update_policy ON scraping_jobs
  FOR UPDATE
  USING (
    auth.uid() = created_by OR 
    (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin')
  );

-- Policy: Users can delete only what they created, admins can delete all
CREATE POLICY scraping_jobs_delete_policy ON scraping_jobs
  FOR DELETE
  USING (
    auth.uid() = created_by OR 
    (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin')
  ); 