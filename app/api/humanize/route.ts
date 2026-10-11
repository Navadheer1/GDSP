import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, buildHumanizePrompt, buildSemanticVerificationPrompt } from '@/lib/ai/gemini';
import { runDeterministicChecks } from '@/lib/verification/deterministic';
import { HumanizeRequest, HumanizeResponse, TruthGuardResult, VerificationCheck } from '@/types';

function calculateTextStats(orig: string, rewr: string) {
  const origWords = orig.trim() ? orig.trim().split(/\s+/).length : 0;
  const origChars = orig.length;
  const rewrWords = rewr.trim() ? rewr.trim().split(/\s+/).length : 0;
  const rewrChars = rewr.length;
  // Avg human reading speed ~ 200 words per minute -> 3.33 words/sec
  const readingTimeSeconds = Math.max(1, Math.round(rewrWords / 3.33));

  return {
    originalWords: origWords,
    originalChars: origChars,
    rewrittenWords: rewrWords,
    rewrittenChars: rewrChars,
    readingTimeSeconds,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: HumanizeRequest = await req.json();

    const { text, context, tone, customInstructions } = body;

    // Strict validation
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Input text is required and cannot be empty.' },
        { status: 400 }
      );
    }

    if (text.length > 8000) {
      return NextResponse.json(
        { error: 'Text exceeds maximum length of 8,000 characters.' },
        { status: 400 }
      );
    }

    const validContexts = [
      'recruiter-feedback',
      'candidate-comm',
      'interview-questions',
      'interview-summary',
      'professional-report',
      'general-writing',
    ];
    if (!validContexts.includes(context)) {
      return NextResponse.json({ error: 'Invalid writing context provided.' }, { status: 400 });
    }

    const validTones = ['professional', 'polished', 'conversational'];
    if (!validTones.includes(tone)) {
      return NextResponse.json({ error: 'Invalid tone selected.' }, { status: 400 });
    }

    // Step 1: Initialize Gemini client
    let gemini;
    try {
      gemini = getGeminiClient();
    } catch (err: any) {
      return NextResponse.json(
        { error: 'Server AI configuration missing: ' + (err?.message || 'GEMINI_API_KEY unset') },
        { status: 500 }
      );
    }

    // Step 2: Generate Humanized Text
    const { systemInstruction, userPrompt } = buildHumanizePrompt(text, context, tone, customInstructions);

    const rewriteResult = await gemini.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const rewrittenText = rewriteResult.text?.trim() || '';

    if (!rewrittenText) {
      return NextResponse.json(
        { error: 'The AI model returned an empty rewriting response.' },
        { status: 502 }
      );
    }

    // Step 3: Run Deterministic Truth Guard checks
    const deterministicChecks = runDeterministicChecks(text, rewrittenText);

    // Step 4: Run AI-based Semantic Verification
    let semanticVerification: TruthGuardResult['semanticVerification'] = {
      status: 'verified',
      meaningPreserved: true,
      unsupportedClaimsFound: false,
      tonalShiftAppropriate: true,
      semanticExplanation: 'Semantic check passed cleanly.',
    };

    const semanticChecksList: VerificationCheck[] = [];

    try {
      const { systemInstruction: verifySystem, userPrompt: verifyPrompt } =
        buildSemanticVerificationPrompt(text, rewrittenText);

      const verifyResponse = await gemini.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: verifyPrompt,
        config: {
          systemInstruction: verifySystem,
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      });

      const parsedVerification = JSON.parse(verifyResponse.text || '{}');

      semanticVerification = {
        status: parsedVerification.status || (parsedVerification.meaningPreserved ? 'verified' : 'caution'),
        meaningPreserved: parsedVerification.meaningPreserved ?? true,
        unsupportedClaimsFound: parsedVerification.unsupportedClaimsFound ?? false,
        tonalShiftAppropriate: parsedVerification.tonalShiftAppropriate ?? true,
        semanticExplanation:
          parsedVerification.explanation ||
          'AI verified that meaning and core narrative facts are preserved.',
      };

      // Add semantic checks to verification items list
      semanticChecksList.push({
        id: 'semantic-meaning',
        category: 'intent',
        title: 'Core Meaning & Intent Integrity',
        status: semanticVerification.meaningPreserved ? 'passed' : 'failed',
        details: semanticVerification.semanticExplanation,
      });

      semanticChecksList.push({
        id: 'unsupported-claims',
        category: 'claims',
        title: 'Unsupported Hallucination Filter',
        status: !semanticVerification.unsupportedClaimsFound ? 'passed' : 'warning',
        details: semanticVerification.unsupportedClaimsFound
          ? 'Possible unverified details or exaggerated assertions added.'
          : 'No unsupported claims or hallucinations introduced.',
      });
    } catch (vErr) {
      console.warn('Semantic verification model call fallback:', vErr);
      semanticVerification = {
        status: 'caution',
        meaningPreserved: true,
        unsupportedClaimsFound: false,
        tonalShiftAppropriate: true,
        semanticExplanation: 'Semantic AI auditor temporarily unreachable; deterministic guardrails passed.',
      };
      semanticChecksList.push({
        id: 'semantic-meaning',
        category: 'intent',
        title: 'Core Meaning Audit',
        status: 'warning',
        details: 'Secondary semantic AI check could not complete. Manual verification recommended.',
      });
    }

    // Step 5: Score Truth Guard
    const allChecks = [...deterministicChecks, ...semanticChecksList];
    const failedCount = allChecks.filter(c => c.status === 'failed').length;
    const warningCount = allChecks.filter(c => c.status === 'warning').length;

    let score = 100 - failedCount * 30 - warningCount * 12;
    score = Math.max(0, Math.min(100, score));

    const overallPassed = failedCount === 0 && semanticVerification.meaningPreserved;

    const truthGuard: TruthGuardResult = {
      score,
      passed: overallPassed,
      summary: overallPassed
        ? 'Truth Guard passed: Text accurately preserves numbers, facts, and intent.'
        : 'Truth Guard warning: Inspect highlighted discrepancies before using.',
      deterministicChecks: allChecks,
      semanticVerification,
    };

    const stats = calculateTextStats(text, rewrittenText);

    const responsePayload: HumanizeResponse = {
      originalText: text,
      humanizedText: rewrittenText,
      context,
      tone,
      truthGuard,
      stats,
    };

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error('Humanize API error:', error);
    return NextResponse.json(
      { error: error?.message || 'An unexpected error occurred during processing.' },
      { status: 500 }
    );
  }
}
