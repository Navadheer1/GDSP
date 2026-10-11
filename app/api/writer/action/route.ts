import { NextRequest, NextResponse } from 'next/server';
import { executeWriterAction } from '@/lib/ai/writer';
import { AIActionRequest } from '@/types/writer';

export async function POST(req: NextRequest) {
  try {
    const body: AIActionRequest = await req.json();
    const { action, selectedText } = body;

    if (!selectedText || typeof selectedText !== 'string' || selectedText.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text was provided to perform this writing action on.' },
        { status: 400 }
      );
    }

    if (selectedText.length > 20000) {
      return NextResponse.json(
        { error: 'The selected text exceeds the maximum processing limit of 20,000 characters.' },
        { status: 400 }
      );
    }

    const validActions = [
      'generate-draft',
      'improve-writing',
      'make-professional',
      'simplify',
      'expand',
      'shorten',
      'continue-writing',
      'fix-grammar',
      'change-tone',
      'translate',
    ];

    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid writing action specified: ${action}` },
        { status: 400 }
      );
    }

    const result = await executeWriterAction(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Writer action API error:', error);
    const message = error?.message || 'An error occurred while executing the writing action.';

    if (message.includes('API key') || message.includes('GEMINI_API_KEY')) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured or is invalid on the server.' },
        { status: 500 }
      );
    }

    if (error?.status === 429 || message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
      return NextResponse.json(
        { error: 'AI rate limit reached. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
