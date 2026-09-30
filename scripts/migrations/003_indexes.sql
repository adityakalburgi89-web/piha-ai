-- Migration 003: Indexes for low-latency call lookup
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_call_sessions_created_at ON call_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_transcripts_session ON call_transcripts(call_session_id, turn_number);
