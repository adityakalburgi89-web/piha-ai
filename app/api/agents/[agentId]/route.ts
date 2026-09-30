import { NextRequest, NextResponse } from 'next/server';
import { agentService } from '@/lib/services/AgentService';
import { AppError } from '@/lib/core/errors/AppError';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const agent = await agentService.getAgentById(agentId);
    return NextResponse.json({
      success: true,
      agent,
    });
  } catch (error: any) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(
      { error: { message: error.message || 'Agent not found', statusCode } },
      { status: statusCode }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    await agentService.deleteAgent(agentId);
    return NextResponse.json({
      success: true,
      message: 'Agent deleted successfully.',
    });
  } catch (error: any) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(
      { error: { message: error.message || 'Failed to delete agent', statusCode } },
      { status: statusCode }
    );
  }
}
