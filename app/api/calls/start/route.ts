import { NextRequest, NextResponse } from 'next/server';
import { callManagementService } from '@/lib/services/CallManagementService';
import { AppError } from '@/lib/core/errors/AppError';

function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = String(phone).replace(/[\s\-\(\)\.]/g, '').trim();
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('00')) return '+' + cleaned.slice(2);
  if (/^0[6-9]\d{9}$/.test(cleaned)) return '+91' + cleaned.slice(1);
  if (/^[6-9]\d{9}$/.test(cleaned)) return '+91' + cleaned;
  if (/^91[6-9]\d{9}$/.test(cleaned)) return '+' + cleaned;
  if (cleaned.length >= 10 && !cleaned.startsWith('+')) return '+' + cleaned;
  return cleaned;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const rawPhone = body.phoneNumber || body.phone || body.to;
    const phoneNumber = normalizePhoneNumber(rawPhone);
    const agentId = body.agentId || null;
    const result = await callManagementService.initiateOutboundCall({
      phoneNumber,
      userId: body.userId || null,
      agentId,
    });

    return NextResponse.json({
      success: true,
      callId: result.callId,
      status: result.status,
      message: 'Call initiated successfully.',
      providerResponse: result.rawPayload,
    });
  } catch (error: any) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Internal server error while starting call.',
          statusCode,
        },
      },
      { status: statusCode }
    );
  }
}
