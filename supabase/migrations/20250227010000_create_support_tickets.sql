-- Support tickets table for contact form and delete requests
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('contact', 'delete_request', 'bug_report', 'feature_request')),
  email TEXT NOT NULL,
  name TEXT DEFAULT '',
  subject TEXT DEFAULT '',
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets (status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_type ON support_tickets (type);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_email ON support_tickets (email);

-- RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (submit a ticket without being logged in)
CREATE POLICY "Anyone can submit tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (true);

-- Only authenticated users (admins) can read tickets
CREATE POLICY "Authenticated users can read tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users (admins) can update tickets
CREATE POLICY "Authenticated users can update tickets"
  ON support_tickets FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated users (admins) can delete tickets
CREATE POLICY "Authenticated users can delete tickets"
  ON support_tickets FOR DELETE
  TO authenticated
  USING (true);
