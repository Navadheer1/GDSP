import { GoogleGenAI } from '@google/genai';
import { WritingContext, WritingTone } from '@/types';

// Keep GEMINI_API_KEY exclusively on server
const apiKey = process.env.GEMINI_API_KEY;

export function getGeminiClient(): GoogleGenAI {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured on the server.');
  }
  return new GoogleGenAI({ apiKey });
}

export function buildHumanizePrompt(text: string, context: WritingContext, tone: WritingTone, customInstructions?: string): {
  systemInstruction: string;
  userPrompt: string;
} {
  const contextDescriptions: Record<WritingContext, string> = {
    'recruiter-feedback': 'Constructive, respectful, clear, and encouraging recruiter candidate feedback.',
    'candidate-comm': 'Warm, transparent, highly communicative candidate outreach or status update.',
    'interview-questions': 'Insightful, natural, non-interrogative, conversational interview questions.',
    'interview-summary': 'Structured, unbiased, factual, crisp interview candidate synthesis for hiring panels.',
    'professional-report': 'Clear, executive-ready, cohesive, active-voice report summary.',
    'general-writing': 'Fluid, natural human writing that flows effortlessly without corporate jargon or robotic cadence.',
  };

  const toneDescriptions: Record<WritingTone, string> = {
    'professional': 'Polished, authoritative yet empathetic, clear, articulate, respectful.',
    'polished': 'Crisp, articulate, dynamic, concise, elegant, and fluid.',
    'conversational': 'Warm, approachable, natural, relatable, and authentic.',
  };

  const systemInstruction = `You are "Humanize AI", a world-class editor and communications specialist.
Your core mission:
IMPROVE THE WRITING WITHOUT CHANGING THE ORIGINAL MEANING.

CRITICAL INVIOLABLE RULES:
1. Preserve all factual claims, names, dates, metrics, percentages, numbers, and technical terminology. Keep numeric counts and metrics intact as exact digits/tokens (e.g. keep '3' as '3', '82%' as '82%', '2 years' as '2 years').
2. Preserve uncertainty, hedging, or lack of verification: If the original says "might", "possibly", "may have", or notes that something "has not been verified", NEVER assert certainty, never remove caveats, and never drop the unverified status.
3. NEVER invent facts, metrics, accomplishments, or claims not present in the original.
4. Eliminate AI telltales: banish overly repetitive transitions (e.g. "Moreover", "Furthermore", "Delve into", "Tapestry", "Testament to"), robotic passive voice, unnecessary flowery adjectives, and hollow filler.
5. Make the cadence natural: vary sentence lengths, ensure genuine human rhythm.
6. Target Context: ${contextDescriptions[context]}
7. Target Tone: ${toneDescriptions[tone]}
${customInstructions ? `Special User Instruction: ${customInstructions}` : ''}

OUTPUT FORMAT:
Return ONLY the rewritten, humanized text. Do not preface with phrases like "Here is the humanized version:" or add quotes around the output.`;

  const userPrompt = `Transform and humanize this text faithfully:\n\n${text}`;

  return { systemInstruction, userPrompt };
}

export function buildSemanticVerificationPrompt(originalText: string, rewrittenText: string): {
  systemInstruction: string;
  userPrompt: string;
} {
  const systemInstruction = `You are "Truth Guard AI", an impartial semantic integrity verification auditor.
Your sole job is to rigorously compare an ORIGINAL text against a REWRITTEN text to detect meaning distortion, hallucinated facts, missed nuances, or inappropriate certainty shifts.

You must respond ONLY with a valid JSON object matching this schema:
{
  "meaningPreserved": boolean,
  "unsupportedClaimsFound": boolean,
  "tonalShiftAppropriate": boolean,
  "status": "verified" | "caution" | "failed",
  "explanation": "concise explanation of semantic fidelity",
  "issues": ["list of any discrepancies, omitted nuances, or invented claims"]
}

Evaluation Criteria:
- status "verified": Original meaning, key facts, numbers, and nuance are faithfully preserved.
- status "caution": Minor nuance shifts or phrasing ambiguities exist, but core facts remain intact.
- status "failed": Key numbers, entities, dates were altered, unsupported facts were invented, or certainty was reversed.`;

  const userPrompt = `Original Text:
"""${originalText}"""

Rewritten Text:
"""${rewrittenText}"""

Audit semantic fidelity and output JSON only.`;

  return { systemInstruction, userPrompt };
}
