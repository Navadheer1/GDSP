import { NextRequest, NextResponse } from 'next/server';
import { generateDocumentDraft } from '@/lib/ai/writer';
import { AIGenerateRequest } from '@/types/writer';

export async function POST(req: NextRequest) {
  try {
    const body: AIGenerateRequest = await req.json();
    const { instructions, formData, templateTitle } = body;

    const hasInstructions = instructions && instructions.trim().length > 0;
    const hasFormValues =
      formData &&
      Object.values(formData).some((v) => typeof v === 'string' && v.trim().length > 0);

    if (!hasInstructions && !hasFormValues) {
      return NextResponse.json(
        {
          error:
            'Please provide either writing instructions or complete at least one form field to generate a draft.',
        },
        { status: 400 }
      );
    }

    if (instructions && instructions.length > 5000) {
      return NextResponse.json(
        { error: 'Instructions exceed maximum allowed limit of 5,000 characters.' },
        { status: 400 }
      );
    }

    const result = await generateDocumentDraft(body);

    return NextResponse.json({
      success: true,
      data: result,
      template: templateTitle || 'Document',
    });
  } catch (error: any) {
    console.error('Writer generate API error:', error);
    const message = error?.message || 'An error occurred while generating the document draft.';

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
