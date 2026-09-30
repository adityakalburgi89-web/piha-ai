-- Migration 002: Turn-by-turn conversational speech transcripts
CREATE TABLE IF NOT EXISTS call_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_session_id UUID REFERENCES call_sessions(id) ON DELETE CASCADE,
  turn_number INT NOT NULL,
  speaker VARCHAR(20) NOT NULL,
  utterance TEXT NOT NULL,
  latency_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
