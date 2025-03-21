-- Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES scraping_jobs(id) ON DELETE CASCADE,
  external_id TEXT,
  data JSONB NOT NULL DEFAULT '{}',
  images TEXT[],
  status TEXT CHECK (status IN ('new', 'updated', 'removed')) DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_vehicles_dealer_id ON vehicles(dealer_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_job_id ON vehicles(job_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_external_id ON vehicles(external_id);

-- Create a GIN index for faster JSON queries
CREATE INDEX IF NOT EXISTS idx_vehicles_data ON vehicles USING GIN (data);

-- Trigger to update the updated_at timestamp on update
CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON vehicles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read
CREATE POLICY vehicles_select_policy ON vehicles
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Users can insert (usually done by the system, but added for completeness)
CREATE POLICY vehicles_insert_policy ON vehicles
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Users can update only vehicles related to the jobs they created, admins can update all
CREATE POLICY vehicles_update_policy ON vehicles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM scraping_jobs 
      WHERE scraping_jobs.id = vehicles.job_id 
      AND scraping_jobs.created_by = auth.uid()
    ) OR (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin')
  );

-- Policy: Users can delete only vehicles related to the jobs they created, admins can delete all
CREATE POLICY vehicles_delete_policy ON vehicles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM scraping_jobs 
      WHERE scraping_jobs.id = vehicles.job_id 
      AND scraping_jobs.created_by = auth.uid()
    ) OR (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin')
  ); 