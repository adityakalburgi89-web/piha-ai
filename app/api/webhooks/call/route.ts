import { NextRequest, NextResponse } from 'next/server';
import { callWebhookOrchestrator } from '@/lib/services/CallWebhookOrchestrator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await callWebhookOrchestrator.processWebhook(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Webhooks/Call] Processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal error processing webhook' },
      { status: error.statusCode || 500 }
    );
  }
}
