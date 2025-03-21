-- Dealers Table
CREATE TABLE IF NOT EXISTS dealers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_dealers_name ON dealers(name);
CREATE INDEX IF NOT EXISTS idx_dealers_status ON dealers(status);
CREATE INDEX IF NOT EXISTS idx_dealers_created_by ON dealers(created_by);

-- Trigger to update the updated_at timestamp on update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dealers_updated_at
BEFORE UPDATE ON dealers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read
CREATE POLICY dealers_select_policy ON dealers
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Users can insert
CREATE POLICY dealers_insert_policy ON dealers
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Users can update only what they created, admins can update all
CREATE POLICY dealers_update_policy ON dealers
  FOR UPDATE
  USING (
    auth.uid() = created_by OR 
    (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin')
  );

-- Policy: Users can delete only what they created, admins can delete all
CREATE POLICY dealers_delete_policy ON dealers
  FOR DELETE
  USING (
    auth.uid() = created_by OR 
    (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin')
  ); 