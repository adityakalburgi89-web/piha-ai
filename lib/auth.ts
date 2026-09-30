import { betterAuth } from 'better-auth';
import pg from 'pg';

const { Pool } = pg;

function getDatabasePool(): pg.Pool | undefined {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.includes('dummy') || dbUrl.includes('your_password') || dbUrl.includes('your_project') || dbUrl.includes('oypqkqkrlubqxjfnibwl')) {
    return undefined;
  }

  try {
    return new Pool({
      connectionString: dbUrl,
      ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  } catch (error) {
    console.warn('[BetterAuth] Failed to initialize PostgreSQL pool, continuing in memory mode:', error);
    return undefined;
  }
}

export const auth = betterAuth({
  database: getDatabasePool(),
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:3003',
    ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL] : []),
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
  ],
  secret:
    process.env.BETTER_AUTH_SECRET ||
    process.env.AUTH_SECRET ||
    'elevate-voice-better-auth-secret-key-32chars',
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
      ? {
          apple: {
            clientId: process.env.APPLE_CLIENT_ID,
            clientSecret: process.env.APPLE_CLIENT_SECRET,
            ...(process.env.APPLE_APP_BUNDLE_IDENTIFIER
              ? { appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER }
              : {}),
          },
        }
      : {}),
  },
});

export type Auth = typeof auth;
