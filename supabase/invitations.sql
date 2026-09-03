-- If the tables already exist, run only these two lines:
-- ALTER TABLE invitations ADD COLUMN IF NOT EXISTS invitor_phone TEXT;
-- ALTER TABLE invitations ALTER COLUMN invitor_phone DROP NOT NULL;

-- Paste this in the Supabase SQL editor and click Run.
-- This drops old invitation tables if they exist, then creates id + name invitors.

DROP TABLE IF EXISTS invitations;
DROP TABLE IF EXISTS invitors;

CREATE TABLE invitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invitor_id UUID NOT NULL REFERENCES invitors(id) ON DELETE CASCADE,
    sambodhan TEXT NOT NULL,
    invitee_name TEXT NOT NULL,
    invitor_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX invitations_invitor_id_idx ON invitations (invitor_id);
CREATE INDEX invitations_created_at_idx ON invitations (created_at DESC);

ALTER TABLE invitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to invitors" ON invitors FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to invitors" ON invitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access to invitations" ON invitations FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to invitations" ON invitations FOR INSERT WITH CHECK (true);
