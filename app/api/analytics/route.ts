import { NextResponse } from 'next/server';
import { analyticsService } from '@/lib/services/AnalyticsService';
import { AppError } from '@/lib/core/errors/AppError';

export async function GET() {
  try {
    const data = await analyticsService.getAnalytics();
    return NextResponse.json({
      success: true,
      analytics: data,
    });
  } catch (error: any) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(
      { error: { message: error.message || 'Failed to calculate analytics', statusCode } },
      { status: statusCode }
    );
  }
}
