import { getGeminiClient } from './gemini';
import {
  AgentChatRequest,
  AgentChatResponse,
  AgentDocumentOperation,
  AgentOperationType,
} from '@/types/writer';

const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-3.7-flash';
const FALLBACK_MODELS = Array.from(
  new Set([
    PRIMARY_MODEL,
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
    'gemini-flash-latest',
  ])
);

const SUPPORTED_OPERATIONS: AgentOperationType[] = [
  'create_document',
  'replace_document',
  'edit_selection',
  'replace_range',
  'insert_text',
  'append_text',
  'format_document',
  'rename_document',
  'summarize_document',
  'translate_document',
  'export_document',
  'undo_last_change',
];

/**
 * Validates model-returned operations before executing on client/server.
 * Reject unsupported operations, malformed payloads, or empty payloads.
 */
export function validateAgentOperation(rawOp: any): AgentDocumentOperation | null {
  if (!rawOp || typeof rawOp !== 'object') return null;
  if (!rawOp.operation || !SUPPORTED_OPERATIONS.includes(rawOp.operation)) return null;
  if (!rawOp.payload || typeof rawOp.payload !== 'object') return null;

  const { operation, payload } = rawOp;

  switch (operation) {
    case 'create_document':
      if (!payload.content || typeof payload.content !== 'string') return null;
      return {
        operation: 'create_document',
        requiresConfirmation: false,
        payload: {
          title: typeof payload.title === 'string' && payload.title.trim() ? payload.title.trim() : 'New Document',
          content: sanitizeHtmlOutput(payload.content),
          documentType: payload.documentType || 'general',
          category: payload.category || 'other',
        },
      };

    case 'replace_document':
      if (!payload.content || typeof payload.content !== 'string') return null;
      return {
        operation: 'replace_document',
        requiresConfirmation: true, // substantial change requires preview/diff
        payload: {
          title: payload.title,
          content: sanitizeHtmlOutput(payload.content),
          summaryOfChanges: payload.summaryOfChanges || 'Updated document content',
        },
      };

    case 'edit_selection':
      if (!payload.replacementHtml || typeof payload.replacementHtml !== 'string') return null;
      return {
        operation: 'edit_selection',
        requiresConfirmation: false,
        payload: {
          replacementHtml: sanitizeHtmlOutput(payload.replacementHtml),
          targetExcerpt: payload.targetExcerpt,
          summaryOfChanges: payload.summaryOfChanges,
        },
      };

    case 'replace_range':
      if (!payload.targetExcerpt || !payload.replacementContent) return null;
      return {
        operation: 'replace_range',
        requiresConfirmation: false,
        payload: {
          targetExcerpt: String(payload.targetExcerpt),
          replacementContent: sanitizeHtmlOutput(String(payload.replacementContent)),
          occurrenceIndex: typeof payload.occurrenceIndex === 'number' ? payload.occurrenceIndex : 0,
          expectedRevision: payload.expectedRevision,
          summaryOfChanges: payload.summaryOfChanges,
        },
      };

    case 'insert_text':
      if (!payload.content || typeof payload.content !== 'string') return null;
      return {
        operation: 'insert_text',
        requiresConfirmation: false,
        payload: {
          content: sanitizeHtmlOutput(payload.content),
          position: payload.position || 'cursor',
        },
      };

    case 'append_text':
      if (!payload.content || typeof payload.content !== 'string') return null;
      return {
        operation: 'append_text',
        requiresConfirmation: false,
        payload: {
          content: sanitizeHtmlOutput(payload.content),
        },
      };

    case 'format_document':
      if (!payload.formattedContent || typeof payload.formattedContent !== 'string') return null;
      return {
        operation: 'format_document',
        requiresConfirmation: true,
        payload: {
          formatStyle: payload.formatStyle || 'letter',
          formattedContent: sanitizeHtmlOutput(payload.formattedContent),
        },
      };

    case 'rename_document':
      if (!payload.title || typeof payload.title !== 'string') return null;
      return {
        operation: 'rename_document',
        requiresConfirmation: false,
        payload: {
          title: payload.title.trim(),
        },
      };

    case 'summarize_document':
      if (!payload.summaryHtml && !payload.summaryText) return null;
      return {
        operation: 'summarize_document',
        requiresConfirmation: false,
        payload: {
          summaryHtml: sanitizeHtmlOutput(payload.summaryHtml || `<p>${payload.summaryText}</p>`),
          summaryText: payload.summaryText || '',
        },
      };

    case 'translate_document':
      if (!payload.translatedContent || !payload.targetLanguage) return null;
      return {
        operation: 'translate_document',
        requiresConfirmation: true,
        payload: {
          targetLanguage: payload.targetLanguage,
          translatedContent: sanitizeHtmlOutput(payload.translatedContent),
        },
      };

    case 'export_document':
      if (!['docx', 'txt', 'pdf'].includes(payload.format)) return null;
      return {
        operation: 'export_document',
        requiresConfirmation: false,
        payload: {
          format: payload.format,
          filename: payload.filename,
        },
      };

    case 'undo_last_change':
      return {
        operation: 'undo_last_change',
        requiresConfirmation: false,
        payload: {
          reason: payload.reason,
        },
      };

    default:
      return null;
  }
}

/**
 * Strips markdown code blocks and validates HTML structure
 */
function sanitizeHtmlOutput(raw: string): string {
  let text = raw.trim();
  if (text.startsWith('```html')) {
    text = text.replace(/^```html\s*/i, '').replace(/\s*```$/i, '');
  } else if (text.startsWith('```')) {
    text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  text = text.trim();
  // Ensure basic paragraph wrapping if plain text returned
  if (!text.startsWith('<') && text.length > 0) {
    text = text
      .split('\n\n')
      .map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
      .join('');
  }
  return text;
}

/**
 * Builds the system instruction for the AI Writing Agent
 */
export function buildAgentSystemInstruction(context: AgentChatRequest['context']): string {
  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `You are "AI Writing Agent", an elite conversational writing assistant integrated into the Writer studio.
You communicate conversationally with the user in natural language and directly manipulate documents in the editor using structured document operations.

CURRENT ENVIRONMENT & DOCUMENT STATE:
- Today's Date: ${currentDateStr}
- Timezone: ${context.timezone || 'UTC'}
- Current Document ID: ${context.currentDocumentId}
- Current Document Title: "${context.currentTitle}"
- Current Revision: ${context.documentRevision}
- Current Word Count: ${context.wordCount}
- Active Selection: ${context.selectedText ? `"""${context.selectedText}"""` : 'None (No text currently selected)'}
- Current Document Body:
"""
${context.currentContentHtml || '<empty document>'}
"""

YOUR CAPABILITIES & OPERATION PROTOCOL:
You can perform these actions by returning a valid JSON object matching the output schema:
1. "create_document":
   - When the user asks to write, draft, or create a new letter, email, report, essay, complaint, or custom document.
   - Also use this if the user asks for a *separate* document while preserving the current one (e.g., "Create a separate email about this issue").
   - Payload: { "title": string, "content": string (semantic HTML: <p>, <h1>, <h2>, <strong>, <em>, <ul>, <ol>, <li>), "documentType": string, "category": "letters" | "emails" | "other" }

2. "replace_document":
   - When the user asks to rewrite, shorten, make professional, improve, or substantially revise the *entire* active document.
   - Payload: { "title": string (optional), "content": string (HTML), "summaryOfChanges": string }

3. "edit_selection":
   - When the user has selected text in the editor and wants to modify/rewrite that specific selection.
   - Payload: { "replacementHtml": string, "targetExcerpt": string, "summaryOfChanges": string }

4. "replace_range":
   - When the user asks to modify a specific section without selecting it (e.g. "change only the subject line", "rewrite the second paragraph", "change the greeting").
   - Payload: { "targetExcerpt": string (exact snippet in the document to replace), "replacementContent": string (new HTML/text), "summaryOfChanges": string }

5. "insert_text":
   - When the user asks to insert content at a specific point (e.g. "add today's date", "add a signature at the bottom").
   - Payload: { "content": string (HTML), "position": "beginning" | "end" | "cursor" }

6. "append_text":
   - When the user asks to add something to the end (e.g. "Add a conclusion to the current report", "Add a postscript").
   - Payload: { "content": string (HTML) }

7. "rename_document":
   - When the user asks to rename the document title.
   - Payload: { "title": string }

8. "summarize_document":
   - When the user asks to summarize the current document. Provide the summary in the chat response and optionally in the operation.
   - Payload: { "summaryHtml": string, "summaryText": string }

9. "translate_document":
   - When the user asks to translate the document into another language (e.g. "Translate this document into Telugu").
   - Payload: { "targetLanguage": string, "translatedContent": string (HTML) }

10. "export_document":
   - When the user asks to export or download the document (e.g. "Export this as DOCX", "Download PDF", "Save as txt").
   - Payload: { "format": "docx" | "txt" | "pdf", "filename": string }

11. "undo_last_change":
   - When the user asks to undo the last edit made by the AI.
   - Payload: { "reason": string }

CONVERSATIONAL INTELLIGENCE & FOLLOW-UP RULES:
1. IDENTIFY MISSING MATERIAL INFORMATION:
   - When the user asks to draft a document (like a letter to a principal, a leave application, or a legal complaint) and critical specifics are missing that materially affect the outcome (e.g. college name, reason for delay, dates of leave, recipient's department):
   - Ask polite, concise conversational follow-up questions.
   - Ask only 1 or 2 high-impact questions at a time.
   - Never ask for information already mentioned in previous messages.
   - If the user provided enough information in their prompt, DO NOT ask unnecessary questions—generate immediately!
   - If missing details are minor or optional, generate the draft using clean placeholders (e.g. [Principal's Name], [College Name], [Roll Number], [Pending Amount]) and let the user know.
2. NEVER INVENT PERSONAL DATA:
   - Never invent personal names, roll numbers, phone numbers, or private details. Use [Placeholders] when not supplied.
3. CONVERSATIONAL RESPONSE:
   - Always accompany an operation with an informative, friendly, concise message explaining what was done.
   - If asking follow-up questions, set "operation" to null and list the questions.
   - Provide 2-3 contextual quick suggestions (suggestedPrompts) for the user's next action.

JSON RESPONSE FORMAT SPECIFICATION:
You MUST respond with a single valid JSON object and nothing else. No markdown fences around the JSON.
Schema:
{
  "message": "Assistant's conversational explanation or follow-up question to the user",
  "operation": {
    "operation": "create_document" | "replace_document" | "edit_selection" | "replace_range" | "insert_text" | "append_text" | "rename_document" | "summarize_document" | "translate_document" | "export_document" | "undo_last_change",
    "payload": { ...operation specific payload... }
  } | null,
  "followUpQuestions": ["optional question 1", ...],
  "suggestedPrompts": ["Contextual next step 1", "Contextual next step 2"]
}`;
}

/**
 * Orchestrates the AI Agent conversation with Gemini
 */
export async function runAIAgentConversation(
  req: AgentChatRequest
): Promise<AgentChatResponse> {
  const gemini = getGeminiClient();
  const systemInstruction = buildAgentSystemInstruction(req.context);

  // Format the conversation history
  const contents = req.messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  try {
    let response: any = null;
    let lastError: any = null;

    for (const modelToTry of FALLBACK_MODELS) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          response = await gemini.models.generateContent({
            model: modelToTry,
            contents,
            config: {
              systemInstruction,
              temperature: 0.6,
              topP: 0.95,
              responseMimeType: 'application/json',
            },
          });
          if (response && response.text) {
            break;
          }
        } catch (err: any) {
          lastError = err;
          const isUnavailable =
            err?.status === 503 ||
            err?.message?.includes('503') ||
            err?.message?.includes('UNAVAILABLE') ||
            err?.message?.includes('high demand');
          if (isUnavailable && attempt === 0) {
            await new Promise((r) => setTimeout(r, 1500));
            continue;
          }

          const isQuotaOrNotFound =
            err?.status === 429 ||
            err?.status === 404 ||
            err?.message?.includes('429') ||
            err?.message?.includes('quota') ||
            err?.message?.includes('not found');
          if (isQuotaOrNotFound) {
            break; // try next model
          }
          throw err;
        }
      }
      if (response && response.text) {
        break;
      }
    }

    if (!response && lastError) {
      throw lastError;
    }

    let rawText = response.text?.trim() || '{}';
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    } else if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('Failed to parse Agent JSON response:', rawText, parseErr);
      return {
        message: rawText || "I've processed your request.",
        operation: null,
      };
    }

    // Validate the proposed document operation
    let validatedOp: AgentDocumentOperation | null = null;
    if (parsed.operation) {
      validatedOp = validateAgentOperation(parsed.operation);
    }

    return {
      message: parsed.message || (validatedOp ? 'Document updated successfully.' : "How else can I assist with your document?"),
      operation: validatedOp,
      followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions : undefined,
      suggestedPrompts: Array.isArray(parsed.suggestedPrompts) ? parsed.suggestedPrompts : undefined,
    };
  } catch (error: any) {
    console.error('Gemini Agent Conversation Error:', error);
    throw error;
  }
}
