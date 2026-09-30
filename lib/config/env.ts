import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // Target Phone Configuration
  DEFAULT_TARGET_PHONE_NUMBER: z.string().default('+919876543210'),
  DEVELOPER_PHONE_NUMBER: z.string().default('+917406209248'),

  // Telephony Configuration
  TELEPHONY_PROVIDER: z.enum(['omnidimension', 'mock']).default('omnidimension'),
  OMNIDIMENSION_API_KEY: z.string().optional().default(''),
  OMNIDIMENSION_AGENT_ID: z.string().optional().default(''),

  // STT / TTS
  STT_PROVIDER: z.string().default('sarvam'),
  SARVAM_API_KEY: z.string().optional().default(''),
  TTS_PROVIDER: z.string().default('sarvam'),

  // LLM Providers
  PRIMARY_LLM_PROVIDER: z.enum(['gemini', 'groq']).default('gemini'),
  FALLBACK_LLM_PROVIDER: z.enum(['gemini', 'groq']).default('groq'),
  GEMINI_API_KEY: z.string().optional().default(''),
  GROQ_API_KEY: z.string().optional().default(''),

  // WhatsApp Providers
  WHATSAPP_PROVIDER: z.enum(['ultramsg', 'twilio', 'meta', 'mock']).default('ultramsg'),
  ULTRAMSG_INSTANCE_ID: z.string().optional().default(''),
  ULTRAMSG_TOKEN: z.string().optional().default(''),

  TWILIO_ACCOUNT_SID: z.string().optional().default(''),
  TWILIO_AUTH_TOKEN: z.string().optional().default(''),
  TWILIO_WHATSAPP_FROM: z.string().optional().default('+17372212163'),

  META_WHATSAPP_TOKEN: z.string().optional().default(''),
  META_PHONE_NUMBER_ID: z.string().optional().default(''),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional().default(''),
  WHATSAPP_ACCESS_TOKEN: z.string().optional().default(''),

  // Google Calendar
  GOOGLE_CALENDAR_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CALENDAR_CLIENT_SECRET: z.string().optional().default(''),
  GOOGLE_CALENDAR_REFRESH_TOKEN: z.string().optional().default(''),
  GOOGLE_CALENDAR_ID: z.string().optional().default('primary'),

  // Database & Supabase
  DATABASE_URL: z.string().optional().default(''),
  SUPABASE_URL: z.string().optional().default(''),
  SUPABASE_ANON_KEY: z.string().optional().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional().default(''),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().default(''),

  // Better Auth & OAuth
  BETTER_AUTH_SECRET: z.string().default('elevate-voice-better-auth-secret-key-32chars'),
  BETTER_AUTH_URL: z.string().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  APPLE_CLIENT_ID: z.string().optional().default(''),
  APPLE_CLIENT_SECRET: z.string().optional().default(''),
  APPLE_APP_BUNDLE_IDENTIFIER: z.string().optional().default('com.example.elevatevoice'),

  // Portfolio & Resume Assets
  RESUME_URL: z.string().default('https://portfolio-aditya-nine-9.vercel.app/'),
  PORTFOLIO_URL: z.string().default('https://portfolio-aditya-nine-9.vercel.app/'),
  ARCHITECTURE_IMAGE_URL: z.string().default('https://portfolio-aditya-nine-9.vercel.app/'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export const env: EnvConfig = envSchema.parse(process.env);
