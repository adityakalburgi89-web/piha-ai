import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const provider = body.provider || 'google';
    const callbackURL = body.callbackURL || '/dashboard';

    const isGoogle = provider === 'google';
    const mockEmail = isGoogle ? 'aditya.google@piha.ai' : 'aditya.apple@piha.ai';
    const mockName = isGoogle ? 'Aditya Kalburgi (Google)' : 'Aditya Kalburgi (Apple)';
    const mockPassword = 'DevTestingPassword!2026';

    // 1. Try signing up the test user
    let authResponse = await auth.api.signUpEmail({
      body: {
        email: mockEmail,
        password: mockPassword,
        name: mockName,
      },
      asResponse: true,
    });

    // 2. If the user already exists, sign them in
    const setCookie = authResponse.headers.get('set-cookie');
    if (!setCookie) {
      authResponse = await auth.api.signInEmail({
        body: {
          email: mockEmail,
          password: mockPassword,
        },
        asResponse: true,
      });
    }

    const sessionCookie = authResponse.headers.get('set-cookie');
    const response = NextResponse.json({
      success: true,
      provider,
      user: {
        name: mockName,
        email: mockEmail,
      },
      url: callbackURL,
    });

    if (sessionCookie) {
      response.headers.set('set-cookie', sessionCookie);
    }

    return response;
  } catch (error: any) {
    console.error('[DevMockAuth] Error creating mock session:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to authenticate in dev mode' },
      { status: 500 }
    );
  }
}
