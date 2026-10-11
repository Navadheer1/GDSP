import { NextRequest, NextResponse } from 'next/server';
import { runAIAgentConversation } from '@/lib/ai/agent';
import { AgentChatRequest } from '@/types/writer';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AgentChatRequest;

    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: messages array is required.' },
        { status: 400 }
      );
    }

    if (!body.context) {
      return NextResponse.json(
        { error: 'Invalid request: context is required.' },
        { status: 400 }
      );
    }

    // Limit messages length to prevent context explosion
    const safeMessages = body.messages.slice(-15);

    // Limit context length if content is extraordinarily huge
    const safeContext = {
      ...body.context,
      currentContentHtml: body.context.currentContentHtml
        ? body.context.currentContentHtml.slice(0, 15000)
        : '',
      currentPlainText: body.context.currentPlainText
        ? body.context.currentPlainText.slice(0, 8000)
        : '',
      selectedText: body.context.selectedText
        ? body.context.selectedText.slice(0, 4000)
        : undefined,
    };

    const agentResult = await runAIAgentConversation({
      messages: safeMessages,
      context: safeContext,
    });

    return NextResponse.json({
      success: true,
      data: agentResult,
    });
  } catch (error: any) {
    console.error('Agent chat API route error:', error);

    const errorMessage = error?.message || 'Agent failed to process the request.';
    const isRateLimit =
      error?.status === 429 ||
      errorMessage.includes('429') ||
      errorMessage.includes('RESOURCE_EXHAUSTED') ||
      errorMessage.includes('rate limit');

    return NextResponse.json(
      {
        error: isRateLimit
          ? 'AI rate limit exceeded. Please wait a few moments and retry.'
          : errorMessage,
      },
      { status: isRateLimit ? 429 : 500 }
    );
  }
}
