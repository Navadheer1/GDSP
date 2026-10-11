export type DocumentCategory = 'letters' | 'emails' | 'other' | 'blank';

export interface WriterDocument {
  id: string;
  userId: string;
  title: string;
  content: string; // HTML formatted string
  plainText: string;
  documentType: string;
  wordCount: number;
  characterCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface TemplateField {
  id: string;
  label: string;
  placeholder?: string;
  type: 'text' | 'textarea' | 'date' | 'select';
  required?: boolean;
  options?: string[];
  defaultValue?: string;
  helpText?: string;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  category: DocumentCategory;
  description: string;
  iconName: string;
  fields: TemplateField[];
  defaultTone?: string;
  recommendedLength?: string;
  scaffoldHtml?: string;
}

export type AIWritingAction =
  | 'generate-draft'
  | 'improve-writing'
  | 'make-professional'
  | 'simplify'
  | 'expand'
  | 'shorten'
  | 'continue-writing'
  | 'fix-grammar'
  | 'change-tone'
  | 'translate';

export type ToneOption =
  | 'Formal'
  | 'Professional'
  | 'Friendly'
  | 'Polite'
  | 'Persuasive'
  | 'Academic'
  | 'Casual';

export type LanguageOption =
  | 'English'
  | 'Spanish'
  | 'French'
  | 'German'
  | 'Italian'
  | 'Portuguese'
  | 'Hindi'
  | 'Chinese'
  | 'Japanese'
  | 'Arabic'
  | 'Russian'
  | 'Dutch';

export interface AIGenerateRequest {
  templateId?: string;
  templateTitle?: string;
  category?: DocumentCategory;
  formData?: Record<string, string>;
  instructions: string;
  tone: ToneOption;
  language: LanguageOption;
  documentType?: string;
}

export interface AIGenerateResponse {
  title?: string;
  contentHtml: string;
  plainText: string;
  wordCount: number;
}

export interface AIActionRequest {
  action: AIWritingAction;
  selectedText: string;
  fullDocumentText?: string;
  instructions?: string;
  targetTone?: ToneOption;
  targetLanguage?: LanguageOption;
}

export interface AIActionResponse {
  action: AIWritingAction;
  originalText: string;
  revisedText: string;
  revisedHtml?: string;
  explanation?: string;
}

// ----------------------------------------------------
// AI WRITING AGENT TYPES & DOCUMENT OPERATIONS
// ----------------------------------------------------

export type AgentOperationType =
  | 'create_document'
  | 'replace_document'
  | 'edit_selection'
  | 'replace_range'
  | 'insert_text'
  | 'append_text'
  | 'format_document'
  | 'rename_document'
  | 'summarize_document'
  | 'translate_document'
  | 'export_document'
  | 'undo_last_change';

export interface CreateDocumentPayload {
  title: string;
  content: string; // HTML formatted string
  documentType?: string;
  category?: DocumentCategory;
}

export interface ReplaceDocumentPayload {
  title?: string;
  content: string; // HTML formatted string
  summaryOfChanges?: string;
}

export interface EditSelectionPayload {
  replacementHtml: string;
  targetExcerpt?: string;
  summaryOfChanges?: string;
}

export interface ReplaceRangePayload {
  targetExcerpt: string;
  replacementContent: string;
  occurrenceIndex?: number;
  expectedRevision?: number;
  summaryOfChanges?: string;
}

export interface InsertTextPayload {
  content: string; // HTML
  position?: 'beginning' | 'end' | 'cursor';
}

export interface AppendTextPayload {
  content: string; // HTML
}

export interface FormatDocumentPayload {
  formatStyle: 'letter' | 'memo' | 'report' | 'email' | 'outline';
  formattedContent: string;
}

export interface RenameDocumentPayload {
  title: string;
}

export interface SummarizeDocumentPayload {
  summaryHtml: string;
  summaryText: string;
}

export interface TranslateDocumentPayload {
  targetLanguage: string;
  translatedContent: string; // HTML
}

export interface ExportDocumentPayload {
  format: 'docx' | 'txt' | 'pdf';
  filename?: string;
}

export interface UndoLastChangePayload {
  reason?: string;
}

export interface AgentDocumentOperation {
  operation: AgentOperationType;
  requiresConfirmation?: boolean; // substantial changes trigger preview diff
  payload:
    | CreateDocumentPayload
    | ReplaceDocumentPayload
    | EditSelectionPayload
    | ReplaceRangePayload
    | InsertTextPayload
    | AppendTextPayload
    | FormatDocumentPayload
    | RenameDocumentPayload
    | SummarizeDocumentPayload
    | TranslateDocumentPayload
    | ExportDocumentPayload
    | UndoLastChangePayload;
}

export interface AgentChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: number;
  operation?: AgentDocumentOperation;
  followUpQuestions?: string[];
  suggestions?: string[];
  status?: 'pending' | 'applied' | 'rejected' | 'failed';
  error?: string;
}

export interface AgentContext {
  currentDocumentId: string;
  currentTitle: string;
  currentContentHtml: string;
  currentPlainText: string;
  selectedText?: string;
  documentRevision: number;
  wordCount: number;
  characterCount: number;
  timezone?: string;
  activeLanguage?: string;
}

export interface AgentChatRequest {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  context: AgentContext;
}

export interface AgentChatResponse {
  message: string;
  operation?: AgentDocumentOperation | null;
  followUpQuestions?: string[];
  suggestedPrompts?: string[];
}

