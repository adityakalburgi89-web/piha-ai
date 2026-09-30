import { NextRequest, NextResponse } from 'next/server';
import { LiveKitTokenService } from '@/lib/services/LiveKitTokenService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const roomName = body.roomName || `piha-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const participantIdentity = body.identity || `user-${Math.random().toString(36).substring(7)}`;
    const participantName = body.name || 'Caller';
    const metadata = {
      agentId: body.agentId || 'agent-ecommerce-neha',
      language: body.language || 'kn-IN',
      clientSource: 'web-browser',
      createdAt: new Date().toISOString(),
    };

    const tokenData = await LiveKitTokenService.createRoomToken({
      roomName,
      participantIdentity,
      participantName,
      metadata,
    });

    return NextResponse.json({
      success: true,
      ...tokenData,
    });
  } catch (error: any) {
    console.error('[API /api/livekit/token] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate LiveKit room token',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomName = searchParams.get('room') || `piha-${Date.now()}`;
  const participantIdentity = searchParams.get('identity') || `user-${Math.random().toString(36).substring(7)}`;
  const language = searchParams.get('lang') || 'kn-IN';

  const tokenData = await LiveKitTokenService.createRoomToken({
    roomName,
    participantIdentity,
    participantName: 'Guest Caller',
    metadata: { language },
  });

  return NextResponse.json({
    success: true,
    ...tokenData,
  });
}