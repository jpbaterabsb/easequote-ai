-- Create quote_emails table (Email delivery log)
CREATE TABLE quote_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  recipient_email VARCHAR(100) NOT NULL,
  subject VARCHAR(200),
  body TEXT,
  language VARCHAR(2) CHECK (language IN ('en', 'es', 'pt')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quote_emails_quote_id ON quote_emails(quote_id);
CREATE INDEX idx_quote_emails_status ON quote_emails(status, sent_at DESC);

-- RLS Policies
ALTER TABLE quote_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quote emails"
  ON quote_emails FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quotes 
      WHERE quotes.id = quote_emails.quote_id 
      AND quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own quote emails"
  ON quote_emails FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotes 
      WHERE quotes.id = quote_emails.quote_id 
      AND quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own quote emails"
  ON quote_emails FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM quotes 
      WHERE quotes.id = quote_emails.quote_id 
      AND quotes.user_id = auth.uid()
    )
  );

