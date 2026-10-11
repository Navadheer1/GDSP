import { NextRequest, NextResponse } from 'next/server';
import { analyzeTextPatterns } from '@/lib/detector/engine';
import { DetectorAnalysisRequest } from '@/types/detector';

export async function POST(req: NextRequest) {
  try {
    const body: DetectorAnalysisRequest = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Input text is required to run the AI Detector analysis.' },
        { status: 400 }
      );
    }

    const words = text.trim().split(/\s+/).length;
    if (words < 25) {
      return NextResponse.json(
        {
          error:
            'Input is too short for a meaningful pattern analysis. Please provide at least 25 words so sentence variance and vocabulary metrics can be calculated.',
        },
        { status: 400 }
      );
    }

    if (text.length > 25000) {
      return NextResponse.json(
        { error: 'Input text exceeds the maximum allowed limit of 25,000 characters.' },
        { status: 400 }
      );
    }

    const result = await analyzeTextPatterns(text);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Detector API error:', error);
    const message = error?.message || 'An error occurred while analyzing the text.';

    if (error?.status === 429 || message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
      return NextResponse.json(
        { error: 'Analysis rate limit reached. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
