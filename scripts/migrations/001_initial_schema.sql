-- Migration 001: Initial schema for leads and call sessions
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100),
  status VARCHAR(50) DEFAULT 'uncontacted',
  score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS call_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  call_sid VARCHAR(100) NOT NULL UNIQUE,
  duration INT DEFAULT 0,
  status VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
