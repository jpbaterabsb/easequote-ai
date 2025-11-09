-- Create audit_log table (Track changes for compliance)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  entity_type VARCHAR(50) NOT NULL, -- 'quote', 'customer', 'profile'
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'status_changed'
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
  ON audit_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs"
  ON audit_log FOR INSERT
  WITH CHECK (true); -- Allow system to insert audit logs

