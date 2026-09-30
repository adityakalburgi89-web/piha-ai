import { NextRequest, NextResponse } from 'next/server';
import { callManagementService } from '@/lib/services/CallManagementService';
import { AppError } from '@/lib/core/errors/AppError';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ callId: string }> }
) {
  try {
    const { callId } = await params;
    const callState = await callManagementService.getCallState(callId);

    return NextResponse.json({
      success: true,
      data: callState,
    });
  } catch (error: any) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Error fetching call state',
          statusCode,
        },
      },
      { status: statusCode }
    );
  }
}
