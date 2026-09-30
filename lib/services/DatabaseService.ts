import pg from 'pg';
import { env } from '../config/env';
import { CallState } from '../core/types/callState';
import { AgentConfig } from '../core/types/agent';

const { Pool } = pg;

export class DatabaseService {
  private pool: pg.Pool | null = null;
  private isConnected: boolean = false;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (connectionString && !connectionString.includes('dummy')) {
      this.pool = new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false,
        },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
    }
  }

  public async initSchema(): Promise<boolean> {
    if (!this.pool) {
      console.log('[DatabaseService] No valid DATABASE_URL configured. Running in in-memory mode.');
      return false;
    }

    try {
      const client = await this.pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS agents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            domain TEXT NOT NULL,
            persona_name TEXT NOT NULL,
            voice_provider TEXT NOT NULL,
            voice_id TEXT NOT NULL,
            voice_name TEXT,
            language_mode TEXT NOT NULL,
            greeting TEXT NOT NULL,
            system_prompt TEXT NOT NULL,
            disposition_options JSONB,
            is_preset BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS calls (
            call_id TEXT PRIMARY KEY,
            user_id UUID,
            phone_number TEXT NOT NULL,
            call_status TEXT NOT NULL,
            detected_language TEXT,
            classification TEXT,
            confidence NUMERIC,
            intent_score NUMERIC,
            lead_details JSONB,
            qualification JSONB,
            mid_call_whatsapp JSONB,
            post_call_whatsapp JSONB,
            callback JSONB,
            transcript JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );

          ALTER TABLE calls ADD COLUMN IF NOT EXISTS user_id UUID;

          CREATE TABLE IF NOT EXISTS scheduled_callbacks (
            id SERIAL PRIMARY KEY,
            call_id TEXT,
            phone_number TEXT NOT NULL,
            original_phrase TEXT,
            resolved_datetime TIMESTAMPTZ,
            timezone TEXT DEFAULT 'Asia/Kolkata',
            calendar_event_id TEXT,
            booked BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS whatsapp_deliveries (
            id SERIAL PRIMARY KEY,
            call_id TEXT,
            phone_number TEXT NOT NULL,
            message_type TEXT NOT NULL,
            message_id TEXT,
            status TEXT,
            content TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);
        this.isConnected = true;
        console.log('[DatabaseService] Connected to Supabase PostgreSQL and initialized schema successfully.');
        return true;
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.error('[DatabaseService] Supabase initialization warning:', err.message);
      return false;
    }
  }

  public async persistCallState(callState: CallState): Promise<boolean> {
    if (!this.pool || !this.isConnected) return false;

    try {
      const query = `
        INSERT INTO calls (
          call_id, user_id, phone_number, call_status, detected_language, classification,
          confidence, intent_score, lead_details, qualification, mid_call_whatsapp,
          post_call_whatsapp, callback, transcript, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
        ON CONFLICT (call_id) DO UPDATE SET
          user_id = COALESCE(EXCLUDED.user_id, calls.user_id),
          call_status = EXCLUDED.call_status,
          detected_language = EXCLUDED.detected_language,
          classification = EXCLUDED.classification,
          confidence = EXCLUDED.confidence,
          intent_score = EXCLUDED.intent_score,
          lead_details = EXCLUDED.lead_details,
          qualification = EXCLUDED.qualification,
          mid_call_whatsapp = EXCLUDED.mid_call_whatsapp,
          post_call_whatsapp = EXCLUDED.post_call_whatsapp,
          callback = EXCLUDED.callback,
          transcript = EXCLUDED.transcript,
          updated_at = NOW();
      `;

      const q = (callState as any).qualification;
      const values = [
        callState.callId,
        callState.userId || null,
        callState.phoneNumber,
        callState.callStatus,
        callState.detectedLanguage || 'en',
        q?.classification || callState.classification || 'UNCLASSIFIED',
        q?.confidence ?? callState.intentConfidence ?? 0,
        q?.intentScore ?? callState.intentScore ?? null,
        JSON.stringify(callState.leadDetails || {}),
        JSON.stringify(q || {}),
        JSON.stringify(callState.midCallWhatsApp || {}),
        JSON.stringify(callState.postCallWhatsApp || {}),
        JSON.stringify(callState.callback || {}),
        JSON.stringify(callState.transcript || []),
      ];

      await this.pool.query(query, values);
      return true;
    } catch (err: any) {
      console.error(`[DatabaseService] Failed to persist call ${callState.callId}:`, err.message);
      return false;
    }
  }

  public async recordCallback(callId: string, phoneNumber: string, phrase: string, resolvedDateTime: string, eventId: string): Promise<boolean> {
    if (!this.pool || !this.isConnected) return false;

    try {
      const query = `
        INSERT INTO scheduled_callbacks (call_id, phone_number, original_phrase, resolved_datetime, calendar_event_id, booked)
        VALUES ($1, $2, $3, $4, $5, true);
      `;
      await this.pool.query(query, [callId, phoneNumber, phrase, resolvedDateTime, eventId]);
      return true;
    } catch (err: any) {
      console.error('[DatabaseService] Failed to record callback:', err.message);
      return false;
    }
  }

  public isAvailable(): boolean {
    return this.isConnected && this.pool !== null;
  }

  public async saveAgent(agent: AgentConfig): Promise<boolean> {
    if (!this.pool || !this.isConnected) return false;

    try {
      const query = `
        INSERT INTO agents (
          id, name, domain, persona_name, voice_provider, voice_id, voice_name,
          language_mode, greeting, system_prompt, disposition_options, is_preset, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          domain = EXCLUDED.domain,
          persona_name = EXCLUDED.persona_name,
          voice_provider = EXCLUDED.voice_provider,
          voice_id = EXCLUDED.voice_id,
          voice_name = EXCLUDED.voice_name,
          language_mode = EXCLUDED.language_mode,
          greeting = EXCLUDED.greeting,
          system_prompt = EXCLUDED.system_prompt,
          disposition_options = EXCLUDED.disposition_options,
          updated_at = NOW();
      `;

      const values = [
        agent.id,
        agent.name,
        agent.domain,
        agent.personaName,
        agent.voiceProvider,
        agent.voiceId,
        agent.voiceName,
        agent.languageMode,
        agent.greeting,
        agent.systemPrompt,
        JSON.stringify(agent.dispositionOptions || []),
        agent.isPreset ?? false,
      ];

      await this.pool.query(query, values);
      return true;
    } catch (err: any) {
      console.error(`[DatabaseService] Failed to save agent ${agent.id}:`, err.message);
      return false;
    }
  }

  public async getAllAgents(): Promise<AgentConfig[] | null> {
    if (!this.pool || !this.isConnected) return null;

    try {
      const result = await this.pool.query(`
        SELECT id, name, domain, persona_name AS "personaName", voice_provider AS "voiceProvider",
               voice_id AS "voiceId", voice_name AS "voiceName", language_mode AS "languageMode",
               greeting, system_prompt AS "systemPrompt", disposition_options AS "dispositionOptions",
               is_preset AS "isPreset", created_at AS "createdAt", updated_at AS "updatedAt"
        FROM agents
        ORDER BY created_at ASC;
      `);

      return result.rows.map((r) => ({
        ...r,
        dispositionOptions: Array.isArray(r.dispositionOptions)
          ? r.dispositionOptions
          : JSON.parse(r.dispositionOptions || '[]'),
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
      }));
    } catch (err: any) {
      console.error('[DatabaseService] Failed to load agents from database:', err.message);
      return null;
    }
  }

  public async deleteAgent(id: string): Promise<boolean> {
    if (!this.pool || !this.isConnected) return false;

    try {
      await this.pool.query('DELETE FROM agents WHERE id = $1 AND is_preset = false', [id]);
      return true;
    } catch (err: any) {
      console.error(`[DatabaseService] Failed to delete agent ${id}:`, err.message);
      return false;
    }
  }
}

export const databaseService = new DatabaseService();

// Configure Supabase postgres pool size and connection retry timeouts
