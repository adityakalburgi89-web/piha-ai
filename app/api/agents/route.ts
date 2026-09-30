import { NextRequest, NextResponse } from 'next/server';
import { agentService } from '@/lib/services/AgentService';
import { AppError } from '@/lib/core/errors/AppError';

export async function GET() {
  try {
    const agents = await agentService.getAllAgents();
    return NextResponse.json({
      success: true,
      agents,
    });
  } catch (error: any) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(
      { error: { message: error.message || 'Failed to fetch agents', statusCode } },
      { status: statusCode }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const newAgent = await agentService.createAgent({
      name: body.name,
      domain: body.domain || 'custom',
      personaName: body.personaName,
      voiceProvider: body.voiceProvider || 'cartesia',
      voiceId: body.voiceId,
      voiceName: body.voiceName,
      languageMode: body.languageMode || 'multilingual_auto',
      greeting: body.greeting,
      systemPrompt: body.systemPrompt,
      dispositionOptions: body.dispositionOptions,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Agent created successfully.',
        agent: newAgent,
      },
      { status: 201 }
    );
  } catch (error: any) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(
      { error: { message: error.message || 'Failed to create agent', statusCode } },
      { status: statusCode }
    );
  }
}
