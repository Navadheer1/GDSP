import { getGeminiClient } from '@/lib/ai/gemini';
import { calculateLinguisticCharacteristics } from './metrics';
import {
  DetectorAnalysisResult,
  DetectorPatternAssessment,
  PassageAnalysis,
} from '@/types/detector';

const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

const STANDARD_LIMITATIONS = [
  'Linguistic pattern analysis is heuristic and estimates stylistic characteristics; it cannot prove or disprove authorship.',
  'Human writers frequently produce uniform, formal, or structured prose that may trigger pattern flags.',
  'AI-generated text that has been edited or written with varied prompt constraints can exhibit natural human cadence.',
  'Short texts (under 100 words) provide limited statistical variance and are inherently prone to inconclusive results.',
];

/**
 * Analyzes text using both deterministic computational linguistics and
 * an AI-assisted stylistic pattern audit.
 */
export async function analyzeTextPatterns(text: string): Promise<DetectorAnalysisResult> {
  const trimmed = text.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;

  if (wordCount < 25) {
    throw new Error('Please provide at least 25 words to perform a meaningful pattern analysis.');
  }

  // Step 1: Calculate deterministic linguistic metrics
  const { characteristics, sentences } = calculateLinguisticCharacteristics(trimmed);

  // Step 2: Run AI-assisted stylistic pattern audit via Gemini
  let aiAssessment: DetectorPatternAssessment = 'mixed-or-inconclusive';
  let summaryExplanation = '';
  let passages: PassageAnalysis[] = [];

  try {
    const gemini = getGeminiClient();

    const systemInstruction = `You are an objective computational linguistics auditor.
Your mission is to perform a heuristic writing-pattern analysis on the provided text.
Examine stylistic characteristics such as:
- Sentence-length variation (burstiness vs. uniformity)
- Syntactic cadence and formulaic transition phrases
- Rhetorical predictability vs. idiosyncratic human voice

CRITICAL GUIDELINES:
1. Do NOT make a definitive scientific claim about authorship. You are evaluating whether observed stylistic patterns resemble typical LLM writing (uniform cadence, repetitive transitions, formulaic structure) or typical human writing (varied sentence lengths, organic transitions, colloquial/idiosyncratic rhythm).
2. Assessment must be one of:
   - "ai-like": High sentence-length uniformity, formulaic transitions, predictable paragraph symmetry.
   - "human-like": Natural burstiness in sentence cadence, organic transitions, varied vocabulary and idiosyncratic syntax.
   - "mixed-or-inconclusive": Text has mixed patterns, could be human edited, or lacks sufficient distinct markers.
3. Extract 2 to 4 notable passages from the text that influenced this assessment.
4. Output must be strictly valid JSON matching this schema:
{
  "assessment": "ai-like" | "human-like" | "mixed-or-inconclusive",
  "explanation": "concise, evidence-based explanation of the observed stylistic patterns",
  "passages": [
    {
      "text": "exact excerpt from the text",
      "title": "short descriptive label",
      "patternType": "uniform-cadence" | "formulaic-transition" | "repetitive-structure" | "varied-human-cadence" | "idiosyncratic" | "neutral",
      "explanation": "why this passage illustrates the pattern"
    }
  ]
}`;

    const metricsSummary = `Calculated Metrics:
- Words: ${characteristics.totalWords}
- Sentences: ${characteristics.totalSentences}
- Avg Sentence Length: ${characteristics.averageSentenceLength} words
- Sentence Length Std Dev: ${characteristics.sentenceLengthStdDev}
- Variation Coefficient (CV): ${characteristics.sentenceVariationCoefficient}
- Vocabulary Diversity Ratio: ${characteristics.vocabularyDiversityRatio}
- Formulaic transitions: ${characteristics.formulaicTransitionsFound.map((t) => `${t.transition} (${t.count})`).join(', ') || 'None'}`;

    const userPrompt = `${metricsSummary}

Text to audit:
"""
${trimmed.slice(0, 8000)}
"""

Audit the writing patterns and return JSON only.`;

    const response = await gemini.models.generateContent({
      model: MODEL_NAME,
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    if (
      parsed.assessment === 'ai-like' ||
      parsed.assessment === 'human-like' ||
      parsed.assessment === 'mixed-or-inconclusive'
    ) {
      aiAssessment = parsed.assessment;
    }

    summaryExplanation =
      parsed.explanation ||
      'Linguistic analysis evaluated cadence variation, lexical diversity, and transition uniformity.';

    if (Array.isArray(parsed.passages)) {
      passages = parsed.passages.map((p: any, idx: number) => ({
        id: `passage-${idx}`,
        text: typeof p.text === 'string' ? p.text : '',
        title: typeof p.title === 'string' ? p.title : 'Notable Passage',
        patternType: p.patternType || 'neutral',
        explanation: typeof p.explanation === 'string' ? p.explanation : '',
      }));
    }
  } catch (err: any) {
    console.warn('AI stylistic audit call issue:', err?.message || err);

    // Fallback to purely deterministic heuristic assessment if Gemini model is rate-limited or fails
    if (characteristics.sentenceVariationCoefficient < 0.28 && characteristics.formulaicTransitionsFound.length > 0) {
      aiAssessment = 'ai-like';
      summaryExplanation =
        'Deterministic analysis detected unusually uniform sentence lengths (low burstiness) combined with repeated transitional markers.';
    } else if (characteristics.sentenceVariationCoefficient > 0.48 && characteristics.vocabularyDiversityRatio > 0.55) {
      aiAssessment = 'human-like';
      summaryExplanation =
        'Deterministic analysis detected varied sentence lengths (high burstiness) and rich vocabulary diversity characteristic of organic human prose.';
    } else {
      aiAssessment = 'mixed-or-inconclusive';
      summaryExplanation =
        'Statistical metrics show a balanced distribution between uniform cadence and varied phrasing, presenting mixed writing characteristics.';
    }

    passages = [
      {
        id: 'p-1',
        text: sentences[0]?.text || trimmed.slice(0, 100),
        title: 'Opening Cadence',
        patternType: 'neutral',
        explanation: `Average sentence length is ${characteristics.averageSentenceLength} words with a coefficient of variation of ${characteristics.sentenceVariationCoefficient}.`,
      },
    ];
  }

  // Label formatting
  let assessmentLabel = 'Mixed or Inconclusive Patterns';
  if (aiAssessment === 'ai-like') {
    assessmentLabel = 'AI-Like Writing Patterns Detected';
  } else if (aiAssessment === 'human-like') {
    assessmentLabel = 'Human-Like Writing Patterns Detected';
  }

  return {
    assessment: aiAssessment,
    assessmentLabel,
    summaryExplanation,
    writingCharacteristics: characteristics,
    passages,
    sentences,
    limitations: STANDARD_LIMITATIONS,
    analysisTimestamp: Date.now(),
  };
}
