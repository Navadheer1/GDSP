import { getGeminiClient } from './gemini';
import {
  AIGenerateRequest,
  AIGenerateResponse,
  AIActionRequest,
  AIActionResponse,
} from '@/types/writer';

// Configurable model name with fallback
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

/**
 * Builds prompt for full document generation (from template forms or custom user prompts)
 */
export function buildDocumentGenerationPrompt(req: AIGenerateRequest): {
  systemInstruction: string;
  userPrompt: string;
} {
  const {
    templateTitle,
    category,
    formData = {},
    instructions,
    tone = 'Professional',
    language = 'English',
  } = req;

  const formDetails = Object.entries(formData)
    .filter(([, val]) => val && val.trim().length > 0)
    .map(([key, val]) => `- ${key}: ${val}`)
    .join('\n');

  const systemInstruction = `You are an elite document writer and editorial assistant.
Your mission is to produce a complete, polished, publication-ready document draft.

CRITICAL INSTRUCTIONS:
1. Target Document Type: ${templateTitle || category || 'General Document'}
2. Selected Category: ${category || 'general'}
3. Desired Tone: ${tone}
4. Desired Language: ${language}
5. FACTUAL FIDELITY & NO FABRICATED PERSONAL DATA:
   - Use only the facts and details explicitly supplied by the user.
   - NEVER fabricate specific dates, physical addresses, personal identities, phone numbers, or confidential claims not provided.
   - For necessary standard letter/email fields where information is omitted, use clean bracketed placeholders such as [Your Name], [Recipient Name], [Company Name], [Date], [Address].
6. STRUCTURAL REQUIREMENTS:
   - For LETTERS: Generate Sender details (if given), [Date], Recipient details, Subject line (where appropriate), Formal salutation (e.g., Dear [Recipient],), structured letter body (opening, context, request/action, conclusion), formal sign-off, and Signature/Sender name.
   - For EMAILS: Start with a clear "Subject: ..." line, appropriate greeting, crisp structured paragraphs, and sign-off.
   - For REPORTS / ESSAYS / OTHER: Include an appropriate H1 Document Title, structured H2/H3 subheadings, bullet lists where appropriate, and a conclusion.
7. OUTPUT FORMAT:
   - Provide the response in clean, semantic HTML suitable for direct insertion into a rich-text editor.
   - Use only the following HTML tags: <p>, <h1>, <h2>, <h3>, <strong>, <em>, <ul>, <ol>, <li>, <br>, <blockquote>.
   - Do NOT wrap the output in markdown code blocks like \`\`\`html. Return RAW HTML only.
   - Do not include preamble phrases like "Here is your letter:". Start immediately with the document content.`;

  const userPrompt = `Generate a complete, high-quality document draft with the following specifications:
${templateTitle ? `Document Template: ${templateTitle}\n` : ''}
${formDetails ? `Provided Information:\n${formDetails}\n` : ''}
${instructions ? `User Specific Instructions:\n${instructions}\n` : ''}
Language: ${language}
Tone: ${tone}`;

  return { systemInstruction, userPrompt };
}

/**
 * Builds prompt for targeted writing actions (improve, simplify, fix grammar, etc.)
 */
export function buildWriterActionPrompt(req: AIActionRequest): {
  systemInstruction: string;
  userPrompt: string;
} {
  const {
    action,
    selectedText,
    fullDocumentText,
    instructions,
    targetTone = 'Professional',
    targetLanguage = 'English',
  } = req;

  const actionDirectives: Record<string, string> = {
    'improve-writing': 'Enhance clarity, phrasing, flow, and impact while strictly maintaining the core message and all facts.',
    'make-professional': 'Rewrite into an authoritative, executive, polished professional tone while eliminating casual colloquialisms.',
    'simplify': 'Make the phrasing clear, direct, and easily understood without reducing key factual substance.',
    'expand': 'Elaborate thoughtfully with meaningful depth, context, and transitional flow while preserving all original facts.',
    'shorten': 'Condense into crisp, concise prose, removing redundant verbiage while retaining all critical facts and requests.',
    'continue-writing': 'Seamlessly continue the narrative or argument from the provided text in the exact same voice and style.',
    'fix-grammar': 'Fix all grammatical, spelling, typographical, and punctuation errors without altering the writer\'s voice or style.',
    'change-tone': `Rephrase the text faithfully in a ${targetTone} tone without altering factual claims.`,
    'translate': `Accurately translate the text into ${targetLanguage}, ensuring idiomatic, natural phrasing that reflects the original meaning.`,
  };

  const directive = actionDirectives[action] || 'Refine and polish the provided text.';

  const systemInstruction = `You are a precision writing assistant.
YOUR GOAL:
${directive}

RULES:
1. Preserve all factual claims, metrics, names, technical terminology, and numerical counts.
2. NEVER invent facts or claims not supported by the context.
3. Target Tone: ${targetTone}
4. Target Language: ${targetLanguage}
5. Return ONLY the rewritten / continued text. Do NOT preface with notes, explanations, or quotes.
6. If the input contains HTML tags (<p>, <strong>, etc.), preserve appropriate HTML formatting in your output. Otherwise return clean formatted paragraphs using <p>, <strong>, <em>, <ul>, <li> where appropriate. Do NOT wrap in \`\`\` code fences.`;

  const userPrompt = `${fullDocumentText && fullDocumentText !== selectedText ? `Document Context (for reference):\n"""${fullDocumentText.slice(0, 2000)}"""\n\n` : ''}${instructions ? `User Instruction: ${instructions}\n\n` : ''}Target Text to transform:\n"""${selectedText}"""`;

  return { systemInstruction, userPrompt };
}

async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      const isRateLimit =
        err?.status === 429 ||
        err?.message?.includes('429') ||
        err?.message?.includes('RESOURCE_EXHAUSTED') ||
        err?.message?.includes('rate limit');
      if (isRateLimit && attempt < maxRetries) {
        // Wait 1.8s before retry
        await new Promise((resolve) => setTimeout(resolve, 1800));
        continue;
      }
      throw err;
    }
  }
  return await fn();
}

/**
 * Executes document generation with Gemini
 */
export async function generateDocumentDraft(
  req: AIGenerateRequest
): Promise<AIGenerateResponse> {
  const gemini = getGeminiClient();
  const { systemInstruction, userPrompt } = buildDocumentGenerationPrompt(req);

  const response = await callWithRetry(() =>
    gemini.models.generateContent({
      model: MODEL_NAME,
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.65,
        topP: 0.9,
      },
    })
  );

  let rawOutput = response.text?.trim() || '';

  // Clean any markdown fences if present
  if (rawOutput.startsWith('```html')) {
    rawOutput = rawOutput.replace(/^```html\s*/i, '').replace(/\s*```$/i, '');
  } else if (rawOutput.startsWith('```')) {
    rawOutput = rawOutput.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  // Ensure content has at least basic paragraph wrapping
  if (!rawOutput.startsWith('<') && rawOutput.length > 0) {
    rawOutput = rawOutput
      .split('\n\n')
      .map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
      .join('');
  }

  // Extract clean plain text for word counting
  const plainText = rawOutput.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = plainText ? plainText.split(/\s+/).length : 0;

  return {
    contentHtml: rawOutput,
    plainText,
    wordCount,
  };
}

/**
 * Executes a targeted writing action with Gemini
 */
export async function executeWriterAction(
  req: AIActionRequest
): Promise<AIActionResponse> {
  const gemini = getGeminiClient();
  const { systemInstruction, userPrompt } = buildWriterActionPrompt(req);

  const response = await callWithRetry(() =>
    gemini.models.generateContent({
      model: MODEL_NAME,
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: req.action === 'fix-grammar' ? 0.1 : 0.6,
        topP: 0.9,
      },
    })
  );

  let revisedText = response.text?.trim() || '';

  if (revisedText.startsWith('```html')) {
    revisedText = revisedText.replace(/^```html\s*/i, '').replace(/\s*```$/i, '');
  } else if (revisedText.startsWith('```')) {
    revisedText = revisedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const plainClean = revisedText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  return {
    action: req.action,
    originalText: req.selectedText,
    revisedText: plainClean,
    revisedHtml: revisedText,
  };
}
