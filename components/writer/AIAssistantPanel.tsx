'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  AgentChatMessage,
  AgentDocumentOperation,
  ToneOption,
  LanguageOption,
  AIWritingAction,
} from '@/types/writer';
import {
  Sparkles,
  ChevronRight,
  X,
  Wand2,
  CheckCheck,
  Minimize2,
  Maximize2,
  ArrowRightCircle,
  Briefcase,
  HelpCircle,
  Languages,
  SlidersHorizontal,
  Loader2,
  Send,
  RotateCcw,
  Bot,
  User,
  CheckCircle2,
  Clock,
  Square,
  RefreshCw,
  PlusCircle,
  AlertCircle,
  FileEdit,
  ArrowDownCircle,
} from 'lucide-react';

interface AIAssistantPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedText: string;
  isGenerating: boolean;
  chatMessages: AgentChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onClearChat: () => void;
  onStopGeneration?: () => void;
  onApplyPendingOperation?: (messageId: string, operation: AgentDocumentOperation) => void;
  onRejectPendingOperation?: (messageId: string) => void;
  // Legacy quick action handlers preserved
  onGenerateDraft: (instructions: string, tone: ToneOption, language: LanguageOption) => Promise<void>;
  onExecuteAction: (
    action: AIWritingAction,
    instructions?: string,
    targetTone?: ToneOption,
    targetLanguage?: LanguageOption
  ) => Promise<void>;
  isMobile?: boolean;
}

const TONE_OPTIONS: ToneOption[] = [
  'Professional',
  'Formal',
  'Friendly',
  'Polite',
  'Persuasive',
  'Academic',
  'Casual',
];

const LANGUAGE_OPTIONS: LanguageOption[] = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Hindi',
  'Chinese',
  'Japanese',
  'Arabic',
  'Russian',
  'Dutch',
];

const EMPTY_STATE_SUGGESTIONS = [
  'Write a hall-ticket request letter to my college principal',
  'Write a professional email requesting a meeting',
  'Create a leave application for three days',
  'Draft a complaint letter about a billing issue',
  'Make the current letter shorter',
  'Translate this document into Telugu',
];

export function AIAssistantPanel({
  isOpen,
  onToggle,
  selectedText,
  isGenerating,
  chatMessages,
  onSendMessage,
  onClearChat,
  onStopGeneration,
  onApplyPendingOperation,
  onRejectPendingOperation,
  onGenerateDraft,
  onExecuteAction,
  isMobile = false,
}: AIAssistantPanelProps) {
  // Tabs: 'agent' (conversational agent) vs 'actions' (quick one-click tools)
  const [activeTab, setActiveTab] = useState<'agent' | 'actions'>('agent');
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Quick actions state
  const [instructions, setInstructions] = useState('');
  const [tone, setTone] = useState<ToneOption>('Professional');
  const [language, setLanguage] = useState<LanguageOption>('English');
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const selectedWordCount = selectedText.trim()
    ? selectedText.trim().split(/\s+/).length
    : 0;

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (activeTab === 'agent') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isGenerating, activeTab]);

  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isGenerating) return;
    setInputText('');
    await onSendMessage(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
    inputRef.current?.focus();
  };

  // Quick Actions handlers
  const handleActionClick = async (action: AIWritingAction) => {
    setActiveAction(action);
    try {
      await onExecuteAction(action, instructions, tone, language);
    } finally {
      setActiveAction(null);
    }
  };

  const handleDraftClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructions.trim()) return;
    setActiveAction('generate-draft');
    try {
      await onGenerateDraft(instructions, tone, language);
    } finally {
      setActiveAction(null);
    }
  };

  const content = (
    <div className="flex flex-col h-full bg-[#FAF9FF] border-l border-[#8E84E0]/20 w-84 sm:w-96 select-none overflow-hidden">
      {/* Top Header */}
      <div className="p-3.5 border-b border-[#8E84E0]/15 flex items-center justify-between bg-white/80 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#6654F5] to-[#8A7CFF] text-white flex items-center justify-center shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#15152B]">
              AI Writing Agent
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {activeTab === 'agent' && chatMessages.length > 0 && (
            <button
              type="button"
              onClick={onClearChat}
              title="Start new conversation"
              className="p-1.5 rounded-lg text-[#6F7088] hover:text-[#15152B] hover:bg-[#F4F2FF] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onToggle}
            title="Collapse AI panel"
            className="p-1.5 rounded-lg text-[#6F7088] hover:text-[#15152B] hover:bg-[#F4F2FF] transition-colors"
          >
            {isMobile ? <X className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="px-3 pt-2.5 pb-1 flex items-center gap-1 bg-white/50 border-b border-[#8E84E0]/10 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('agent')}
          className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'agent'
              ? 'bg-[#EBE8FF] text-[#5542E5] shadow-2xs'
              : 'text-[#6F7088] hover:text-[#15152B] hover:bg-[#F4F2FF]'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Conversational Agent</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('actions')}
          className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'actions'
              ? 'bg-[#EBE8FF] text-[#5542E5] shadow-2xs'
              : 'text-[#6F7088] hover:text-[#15152B] hover:bg-[#F4F2FF]'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Quick Actions</span>
        </button>
      </div>

      {/* Tab 1: Conversational AI Agent */}
      {activeTab === 'agent' && (
        <div className="flex-1 flex flex-col min-h-0 bg-[#FAF9FF]">
          {/* Active Target Banner */}
          <div className="px-3 py-1.5 bg-[#F4F2FF] border-b border-[#8E84E0]/15 flex items-center justify-between text-[11px] text-[#6F7088]">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  selectedWordCount > 0 ? 'bg-[#6654F5]' : 'bg-emerald-500'
                }`}
              />
              {selectedWordCount > 0 ? (
                <span className="font-medium text-[#5542E5]">
                  Selection target ({selectedWordCount} words)
                </span>
              ) : (
                <span>Connected to active document</span>
              )}
            </span>
            <span className="text-[10px] text-[#9596AA]">Live Editor Sync</span>
          </div>

          {/* Chat Messages Scrollable List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5">
            {chatMessages.length === 0 ? (
              /* Empty State with Suggestions */
              <div className="h-full flex flex-col justify-center items-center text-center px-2 py-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EBE8FF] text-[#6654F5] flex items-center justify-center shadow-2xs">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-[#15152B]">
                    How can I help you write today?
                  </h3>
                  <p className="text-[11px] text-[#6F7088] max-w-xs leading-relaxed">
                    Ask me to write letters, emails, reports, shorten, translate, or refine your document in natural language.
                  </p>
                </div>

                <div className="w-full space-y-1.5 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9596AA] block text-left px-1">
                    Suggested prompts
                  </span>
                  <div className="space-y-1.5">
                    {EMPTY_STATE_SUGGESTIONS.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left text-xs text-[#15152B] bg-white hover:bg-[#F4F2FF] hover:border-[#6654F5]/30 border border-[#8E84E0]/20 rounded-xl px-3 py-2 transition-all flex items-center justify-between group shadow-2xs"
                      >
                        <span className="truncate pr-2">{suggestion}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#9596AA] group-hover:text-[#6654F5] shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Conversation Messages */
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-[#9596AA] mb-1 px-1">
                    {msg.sender === 'user' ? (
                      <>
                        <span>You</span>
                        <span>·</span>
                        <Clock className="w-2.5 h-2.5" />
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-2.5 h-2.5 text-[#6654F5]" />
                        <span className="font-semibold text-[#5542E5]">AI Writing Agent</span>
                        <span>·</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </>
                    )}
                  </div>

                  <div
                    className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-[#6654F5] to-[#7869FF] text-white rounded-br-xs shadow-2xs'
                        : 'bg-white border border-[#8E84E0]/25 text-[#15152B] rounded-bl-xs shadow-2xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* Follow-up Questions Pill Box */}
                    {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-[#8E84E0]/15 space-y-1.5">
                        <span className="text-[10px] font-bold text-[#6654F5] uppercase tracking-wider block">
                          Please provide:
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-[11px] text-[#4F5068]">
                          {msg.followUpQuestions.map((q, qIdx) => (
                            <li key={qIdx}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Structured Document Operation Status Badge */}
                    {msg.operation && (
                      <div className="mt-2.5 pt-2 border-t border-[#8E84E0]/15">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1 text-[#5542E5] font-semibold">
                            <FileEdit className="w-3.5 h-3.5" />
                            {msg.operation.operation === 'create_document' && 'New Document Created'}
                            {msg.operation.operation === 'replace_document' && 'Document Rewritten'}
                            {msg.operation.operation === 'edit_selection' && 'Selection Updated'}
                            {msg.operation.operation === 'replace_range' && 'Target Section Modified'}
                            {msg.operation.operation === 'insert_text' && 'Content Inserted'}
                            {msg.operation.operation === 'append_text' && 'Content Appended'}
                            {msg.operation.operation === 'rename_document' && 'Document Renamed'}
                            {msg.operation.operation === 'translate_document' && 'Document Translated'}
                            {msg.operation.operation === 'export_document' && 'Document Exported'}
                            {msg.operation.operation === 'undo_last_change' && 'Change Undone'}
                          </span>

                          {msg.status === 'applied' && (
                            <span className="flex items-center gap-0.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium text-[10px] border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Applied
                            </span>
                          )}

                          {msg.status === 'pending' && (
                            <span className="flex items-center gap-0.5 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium text-[10px] border border-amber-200">
                              Preview Ready
                            </span>
                          )}

                          {msg.status === 'rejected' && (
                            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-medium text-[10px] border border-rose-200">
                              Rejected
                            </span>
                          )}
                        </div>

                        {/* Interactive Confirm/Reject Buttons for Pending Operations */}
                        {msg.status === 'pending' && onApplyPendingOperation && onRejectPendingOperation && (
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => onApplyPendingOperation(msg.id, msg.operation!)}
                              className="flex-1 py-1.5 bg-[#6654F5] hover:bg-[#5542E5] text-white text-[11px] font-semibold rounded-lg shadow-2xs transition-colors"
                            >
                              Apply to Document
                            </button>
                            <button
                              type="button"
                              onClick={() => onRejectPendingOperation(msg.id)}
                              className="px-2.5 py-1.5 bg-white border border-[#8E84E0]/30 hover:bg-[#F4F2FF] text-[#6F7088] text-[11px] font-medium rounded-lg transition-colors"
                            >
                              Discard
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Contextual Suggestions after Assistant Response */}
                  {msg.sender === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5 pl-1 max-w-[95%]">
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => handleSuggestionClick(sug)}
                          className="text-[10px] font-medium text-[#5542E5] bg-[#EBE8FF]/80 hover:bg-[#EBE8FF] border border-[#6654F5]/25 px-2.5 py-1 rounded-full transition-all text-left"
                        >
                          + {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Generating Typing State */}
            {isGenerating && (
              <div className="flex flex-col items-start space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-[#5542E5] px-1 font-semibold">
                  <Sparkles className="w-2.5 h-2.5 text-[#6654F5]" />
                  <span>Agent is thinking...</span>
                </div>
                <div className="bg-white border border-[#8E84E0]/25 rounded-2xl rounded-bl-xs px-4 py-3 shadow-2xs flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#6654F5] animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-[#6654F5] animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-[#6654F5] animate-bounce" />
                  </div>
                  <span className="text-[11px] text-[#6F7088]">Analyzing request & document...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Box */}
          <div className="p-3 bg-white border-t border-[#8E84E0]/20">
            <form onSubmit={handleSendChat} className="space-y-2">
              <div className="relative rounded-xl border border-[#8E84E0]/30 focus-within:border-[#6654F5] focus-within:ring-2 focus-within:ring-[#6654F5]/20 bg-white transition-all">
                <textarea
                  ref={inputRef}
                  rows={2}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask the writing agent (e.g. Write a letter to principal, make it shorter)..."
                  disabled={isGenerating}
                  className="w-full px-3 py-2 text-xs bg-transparent focus:outline-none text-[#15152B] placeholder-[#9596AA] leading-relaxed resize-none"
                />

                <div className="flex items-center justify-between px-2.5 pb-2 pt-0.5">
                  <span className="text-[10px] text-[#9596AA]">
                    Enter to send · Shift+Enter for newline
                  </span>

                  <div className="flex items-center gap-1">
                    {isGenerating && onStopGeneration && (
                      <button
                        type="button"
                        onClick={onStopGeneration}
                        title="Stop generation"
                        className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Square className="w-3 h-3 fill-current" />
                        <span>Stop</span>
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={isGenerating || !inputText.trim()}
                      className="p-1.5 text-white bg-gradient-to-r from-[#6654F5] to-[#8A7CFF] hover:from-[#5542E5] hover:to-[#7869FF] rounded-lg shadow-2xs transition-all disabled:opacity-40 active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Fast 1-Click Writing Tools */}
      {activeTab === 'actions' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Selection Context Pill */}
          <div
            className={`p-3 rounded-xl border text-xs transition-colors ${
              selectedWordCount > 0
                ? 'bg-[#EBE8FF]/60 border-[#6654F5]/30 text-[#5542E5]'
                : 'bg-white border-[#8E84E0]/20 text-[#6F7088]'
            }`}
          >
            <div className="flex items-center justify-between font-semibold">
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    selectedWordCount > 0 ? 'bg-[#6654F5]' : 'bg-[#9596AA]'
                  }`}
                />
                {selectedWordCount > 0 ? 'Targeting Selection' : 'Targeting Entire Doc'}
              </span>
              <span>
                {selectedWordCount > 0
                  ? `${selectedWordCount} words`
                  : 'Full document'}
              </span>
            </div>
            <p className="text-[11px] mt-1 text-[#6F7088] font-normal leading-relaxed">
              {selectedWordCount > 0
                ? 'Actions will polish the selected text and show a comparison preview.'
                : 'Select text to refine a specific passage, or run actions on the full text.'}
            </p>
          </div>

          {/* AI Prompt / Instruction Generator */}
          <form onSubmit={handleDraftClick} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#15152B] flex items-center gap-1">
                <Wand2 className="w-3.5 h-3.5 text-[#6654F5]" />
                Prompt Instructions
              </label>
              <span className="text-[10px] text-[#9596AA]">Natural language</span>
            </div>

            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g., Write a polite request asking my professor for a 3-day extension on the research paper..."
              disabled={isGenerating}
              className="w-full px-3 py-2 text-xs bg-white border border-[#8E84E0]/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6654F5] text-[#15152B] placeholder-[#9596AA] leading-relaxed resize-none"
            />

            <button
              type="submit"
              disabled={isGenerating || !instructions.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#6654F5] via-[#7563FF] to-[#8A7CFF] hover:from-[#5542E5] hover:to-[#7869FF] rounded-xl shadow-xs transition-all disabled:opacity-40 active:scale-[0.98]"
            >
              {isGenerating && activeAction === 'generate-draft' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Draft...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Draft</span>
                </>
              )}
            </button>
          </form>

          {/* Tone & Language Selectors */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-[#6F7088] mb-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-[#6654F5]" /> Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as ToneOption)}
                disabled={isGenerating}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#8E84E0]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6654F5] text-[#15152B]"
              >
                {TONE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#6F7088] mb-1 flex items-center gap-1">
                <Languages className="w-3 h-3 text-[#6654F5]" /> Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageOption)}
                disabled={isGenerating}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#8E84E0]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6654F5] text-[#15152B]"
              >
                {LANGUAGE_OPTIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fast 1-Click Writing Actions */}
          <div className="space-y-2 pt-2 border-t border-[#8E84E0]/15">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F7088]">
                Writing Actions
              </span>
              <span className="text-[10px] text-[#9596AA]">Instant polish</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {/* Improve Writing */}
              <button
                type="button"
                onClick={() => handleActionClick('improve-writing')}
                disabled={isGenerating}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#15152B] bg-white hover:bg-[#F4F2FF] hover:border-[#6654F5]/30 border border-[#8E84E0]/20 rounded-xl transition-all disabled:opacity-50 text-left"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#6654F5]" />
                  <span>Improve Writing</span>
                </span>
                {isGenerating && activeAction === 'improve-writing' && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6654F5]" />
                )}
              </button>

              {/* Make Professional */}
              <button
                type="button"
                onClick={() => handleActionClick('make-professional')}
                disabled={isGenerating}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#15152B] bg-white hover:bg-[#F4F2FF] hover:border-[#6654F5]/30 border border-[#8E84E0]/20 rounded-xl transition-all disabled:opacity-50 text-left"
              >
                <span className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-[#6654F5]" />
                  <span>Make Professional</span>
                </span>
                {isGenerating && activeAction === 'make-professional' && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6654F5]" />
                )}
              </button>

              {/* Simplify */}
              <button
                type="button"
                onClick={() => handleActionClick('simplify')}
                disabled={isGenerating}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#15152B] bg-white hover:bg-[#F4F2FF] hover:border-[#6654F5]/30 border border-[#8E84E0]/20 rounded-xl transition-all disabled:opacity-50 text-left"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-[#6654F5]" />
                  <span>Simplify Language</span>
                </span>
                {isGenerating && activeAction === 'simplify' && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6654F5]" />
                )}
              </button>

              {/* Fix Grammar */}
              <button
                type="button"
                onClick={() => handleActionClick('fix-grammar')}
                disabled={isGenerating}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#15152B] bg-white hover:bg-[#F4F2FF] hover:border-[#6654F5]/30 border border-[#8E84E0]/20 rounded-xl transition-all disabled:opacity-50 text-left"
              >
                <span className="flex items-center gap-2">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Fix Grammar & Spelling</span>
                </span>
                {isGenerating && activeAction === 'fix-grammar' && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6654F5]" />
                )}
              </button>

              {/* Expand & Shorten Row */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleActionClick('expand')}
                  disabled={isGenerating}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-medium text-[#15152B] bg-white hover:bg-[#F4F2FF] hover:border-[#6654F5]/30 border border-[#8E84E0]/20 rounded-xl transition-all disabled:opacity-50"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-[#6654F5]" />
                  <span>Expand</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleActionClick('shorten')}
                  disabled={isGenerating}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-medium text-[#15152B] bg-white hover:bg-[#F4F2FF] hover:border-[#6654F5]/30 border border-[#8E84E0]/20 rounded-xl transition-all disabled:opacity-50"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-[#6654F5]" />
                  <span>Shorten</span>
                </button>
              </div>

              {/* Continue Writing */}
              <button
                type="button"
                onClick={() => handleActionClick('continue-writing')}
                disabled={isGenerating}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#15152B] bg-white hover:bg-[#F4F2FF] hover:border-[#6654F5]/30 border border-[#8E84E0]/20 rounded-xl transition-all disabled:opacity-50 text-left"
              >
                <span className="flex items-center gap-2">
                  <ArrowRightCircle className="w-3.5 h-3.5 text-[#6654F5]" />
                  <span>Continue Writing</span>
                </span>
                {isGenerating && activeAction === 'continue-writing' && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6654F5]" />
                )}
              </button>

              {/* Change Tone */}
              <button
                type="button"
                onClick={() => handleActionClick('change-tone')}
                disabled={isGenerating}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#15152B] bg-white hover:bg-[#F4F2FF] hover:border-[#6654F5]/30 border border-[#8E84E0]/20 rounded-xl transition-all disabled:opacity-50 text-left"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#6654F5]" />
                  <span>Apply Tone ({tone})</span>
                </span>
                {isGenerating && activeAction === 'change-tone' && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6654F5]" />
                )}
              </button>

              {/* Translate */}
              <button
                type="button"
                onClick={() => handleActionClick('translate')}
                disabled={isGenerating}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#15152B] bg-white hover:bg-[#F4F2FF] hover:border-[#6654F5]/30 border border-[#8E84E0]/20 rounded-xl transition-all disabled:opacity-50 text-left"
              >
                <span className="flex items-center gap-2">
                  <Languages className="w-3.5 h-3.5 text-[#6654F5]" />
                  <span>Translate to {language}</span>
                </span>
                {isGenerating && activeAction === 'translate' && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6654F5]" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex justify-end">
        <div
          className="fixed inset-0 bg-[#15152B]/40 backdrop-blur-xs transition-opacity"
          onClick={onToggle}
        />
        <div className="relative z-10">{content}</div>
      </div>
    );
  }

  if (!isOpen) return null;

  return content;
}
