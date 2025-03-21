-- Scraper Configs Table
CREATE TABLE IF NOT EXISTS scraper_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  config_json JSONB NOT NULL,
  is_template BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_scraper_configs_dealer_id ON scraper_configs(dealer_id);
CREATE INDEX IF NOT EXISTS idx_scraper_configs_is_template ON scraper_configs(is_template);
CREATE INDEX IF NOT EXISTS idx_scraper_configs_created_by ON scraper_configs(created_by);

-- Trigger to update the updated_at timestamp on update
CREATE TRIGGER update_scraper_configs_updated_at
BEFORE UPDATE ON scraper_configs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies
ALTER TABLE scraper_configs ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read
CREATE POLICY scraper_configs_select_policy ON scraper_configs
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Users can insert
CREATE POLICY scraper_configs_insert_policy ON scraper_configs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Users can update only what they created, admins can update all
CREATE POLICY scraper_configs_update_policy ON scraper_configs
  FOR UPDATE
  USING (
    auth.uid() = created_by OR 
    (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin')
  );

-- Policy: Users can delete only what they created, admins can delete all
CREATE POLICY scraper_configs_delete_policy ON scraper_configs
  FOR DELETE
  USING (
    auth.uid() = created_by OR 
    (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin')
  ); 