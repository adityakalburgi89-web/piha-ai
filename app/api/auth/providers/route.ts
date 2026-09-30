import { NextResponse } from 'next/server';

export async function GET() {
  const hasGoogle = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const hasApple = Boolean(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET);

  return NextResponse.json({
    google: hasGoogle,
    apple: hasApple,
  });
}
