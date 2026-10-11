'use client';

import React, { useState } from 'react';
import ContextSelector from './ContextSelector';
import ToneSelector from './ToneSelector';
import TruthGuardPanel from './TruthGuardPanel';
import { WritingContext, WritingTone, HumanizeResponse, SavedHistoryItem } from '@/types';
import {
  Sparkles,
  Eraser,
  AlertCircle,
  Loader2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  RotateCcw,
  Eye,
  Sliders,
  BookmarkPlus,
  Clock,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/authContext';
import { saveRewriteHistory } from '@/lib/firebase/history';

interface HumanizeWorkspaceProps {
  onSavedToHistory?: () => void;
  loadedHistoryItem?: SavedHistoryItem | null;
}

const SAMPLE_TEXTS = [
  {
    label: 'Truth Guard Challenge',
    text: `The candidate completed 3 projects using Python and Java. The candidate scored 82% in the technical assessment and has 2 years of professional experience. The candidate may have basic knowledge of cloud computing, but this has not been verified.`,
    context: 'recruiter-feedback' as WritingContext,
    tone: 'professional' as WritingTone,
  },
  {
    label: 'Recruiter Feedback',
    text: `Candidate demonstrated foundational understanding of JavaScript paradigms. However, candidate failed to articulate advanced concurrency synchronization mechanics during problem 3. Consequently, candidate is rejected for the Senior Frontend Engineer role, but candidate may re-apply after a period of 6 months.`,
    context: 'recruiter-feedback' as WritingContext,
    tone: 'professional' as WritingTone,
  },
  {
    label: 'Interview Summary',
    text: `In summary, the applicant John Doe was interviewed on Oct 11, 2026 for the Cloud Architect role. Candidate answered 4 out of 5 architecture scenarios correctly with AWS and Kubernetes expertise. Overall recommendation is strong hire with a starting base salary expectation of $165,000.`,
    context: 'interview-summary' as WritingContext,
    tone: 'polished' as WritingTone,
  },
  {
    label: 'Robotic Report',
    text: `It is observed that the deployment pipeline experienced a latency regression of 42% on Friday, October 9th. It is imperative that the engineering squad executes optimization initiatives forthwith in Q4 2026 to mitigate subsequent outages.`,
    context: 'professional-report' as WritingContext,
    tone: 'polished' as WritingTone,
  },
];

/**
 * Clean tokenized diff highlight between original and rewritten text
 */
function renderHighlightedDiff(original: string, rewritten: string) {
  const origTokens = new Set(
    original
      .toLowerCase()
      .split(/[\s,.;:!?()]+/)
      .filter((t) => t.length > 2)
  );

  const rewrTokens = rewritten.split(/(\s+)/);

  return rewrTokens.map((chunk, idx) => {
    const cleanChunk = chunk.toLowerCase().replace(/[^a-z0-9$%]/g, '');
    if (!cleanChunk || cleanChunk.length <= 2) {
      return <span key={idx}>{chunk}</span>;
    }

    const isNew = !origTokens.has(cleanChunk);
    if (isNew) {
      return (
        <span
          key={idx}
          className="bg-[#EBE8FF] text-[#5542E5] border-b-2 border-[#8A7CFF] font-semibold px-0.5 rounded-xs"
        >
          {chunk}
        </span>
      );
    }
    return <span key={idx}>{chunk}</span>;
  });
}

export default function HumanizeWorkspace({
  onSavedToHistory,
  loadedHistoryItem,
}: HumanizeWorkspaceProps) {
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [context, setContext] = useState<WritingContext>('recruiter-feedback');
  const [tone, setTone] = useState<WritingTone>('professional');
  const [customInstructions, setCustomInstructions] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HumanizeResponse | null>(null);

  // Output panel local states
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync if an item was loaded from the History drawer
  React.useEffect(() => {
    if (loadedHistoryItem) {
      setInputText(loadedHistoryItem.originalText);
      setContext(loadedHistoryItem.context);
      setTone(loadedHistoryItem.tone);
      setResult({
        originalText: loadedHistoryItem.originalText,
        humanizedText: loadedHistoryItem.humanizedText,
        context: loadedHistoryItem.context,
        tone: loadedHistoryItem.tone,
        truthGuard: {
          score: loadedHistoryItem.verificationScore,
          passed: loadedHistoryItem.verificationStatus === 'passed',
          status: loadedHistoryItem.verificationStatus === 'passed' ? 'verified' : 'warning',
          summary:
            loadedHistoryItem.verificationStatus === 'passed'
              ? 'Saved Session: All facts, numbers, and intent verified intact.'
              : 'Saved Session: Contains flagged warnings from previous review.',
          deterministicChecks: [],
          semanticVerification: {
            status: loadedHistoryItem.verificationStatus === 'passed' ? 'verified' : 'caution',
            meaningPreserved: true,
            unsupportedClaimsFound: false,
            tonalShiftAppropriate: true,
            semanticExplanation: 'Loaded from your personal Cloud Firestore archive.',
          },
        },
        stats: {
          originalWords: loadedHistoryItem.originalText.trim().split(/\s+/).length,
          originalChars: loadedHistoryItem.originalText.length,
          rewrittenWords: loadedHistoryItem.humanizedText.trim().split(/\s+/).length,
          rewrittenChars: loadedHistoryItem.humanizedText.length,
          readingTimeSeconds: Math.max(
            1,
            Math.round(loadedHistoryItem.humanizedText.trim().split(/\s+/).length / 3.3)
          ),
        },
      });
    }
  }, [loadedHistoryItem]);

  const handleHumanize = async (overrideInstructions?: string) => {
    if (loading) return;
    if (!inputText.trim()) {
      setError('Please provide text to humanize.');
      return;
    }
    if (inputText.length > 8000) {
      setError('Text exceeds maximum length of 8,000 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    setSaveSuccess(false);
    setSaveError(null);

    const instructionsToSend =
      overrideInstructions !== undefined
        ? overrideInstructions
        : customInstructions.trim() || undefined;

    try {
      const response = await fetch('/api/humanize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          context,
          tone,
          customInstructions: instructionsToSend,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to humanize text.');
      }

      setResult(data);
    } catch (err: any) {
      console.error('Humanize error:', err);
      setError(err.message || 'An error occurred while communicating with Gemini AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaferRewrite = () => {
    const safeInstruction =
      'STRICT FACTUAL ADHERENCE: Strictly retain all numbers, dates, and named entities without altering any phrasing of metrics, and retain all uncertainty indicators intact.';
    setCustomInstructions(safeInstruction);
    setShowAdvanced(true);
    handleHumanize(safeInstruction);
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    setError(null);
    setShowDiff(false);
    setSaveSuccess(false);
    setSaveError(null);
  };

  const loadSample = (sample: (typeof SAMPLE_TEXTS)[0]) => {
    setInputText(sample.text);
    setContext(sample.context);
    setTone(sample.tone);
    setError(null);
    setSaveSuccess(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSaveToHistory = async () => {
    if (!result) return;
    if (!user) {
      setSaveError('Sign in to save this rewrite to your history.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      await saveRewriteHistory(user.uid, {
        originalText: result.originalText,
        humanizedText: result.humanizedText,
        context: result.context,
        tone: result.tone,
        verificationStatus: result.truthGuard.passed ? 'passed' : 'warning',
        verificationScore: result.truthGuard.score,
      });
      setSaveSuccess(true);
      if (onSavedToHistory) onSavedToHistory();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Save history error:', err);
      setSaveError('Failed to save to Firestore. Check connection.');
    } finally {
      setSaving(false);
    }
  };

  const inputCharCount = inputText.length;
  const inputWordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const hasIssues = result ? !result.truthGuard.passed || result.truthGuard.status !== 'verified' : false;

  return (
    <div className="space-y-4">
      {/* Quick Samples: Single Compact Horizontal Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F7088] shrink-0 mr-1">
          Samples:
        </span>
        {SAMPLE_TEXTS.map((sample) => {
          const isCurrent = inputText === sample.text;
          return (
            <button
              key={sample.label}
              type="button"
              disabled={loading}
              onClick={() => loadSample(sample)}
              className={`shrink-0 text-xs px-3 py-1 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6654F5] ${
                isCurrent
                  ? 'bg-[#6654F5] text-white font-semibold shadow-2xs'
                  : 'bg-white hover:bg-[#F4F2FF] text-[#6F7088] hover:text-[#15152B] border border-[#8E84E0]/20'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {sample.label}
            </button>
          );
        })}
      </div>

      {/* TWO-PANEL EDITOR WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 items-start">
        
        {/* ========================================================= */}
        {/* LEFT PANEL: ORIGINAL TEXT EDITOR & COMPACT CONTROLS     */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-[#8E84E0]/25 shadow-card flex flex-col overflow-hidden min-w-0">
          {/* Left Panel Header */}
          <div className="bg-[#FAF9FF] px-4 py-2.5 border-b border-[#8E84E0]/15 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6654F5]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#15152B]">
                Original Input
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#6F7088]">
              <span>{inputWordCount} words</span>
              <span className="text-[#8E84E0]/30">·</span>
              <span className={inputCharCount > 7500 ? 'text-amber-600 font-semibold' : ''}>
                {inputCharCount}/8,000
              </span>
              {inputText && (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={loading}
                  className="ml-1 text-[#6F7088] hover:text-[#15152B] p-1 rounded hover:bg-[#F4F2FF] transition-colors"
                  title="Clear original text"
                >
                  <Eraser className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Textarea Area */}
          <div className="p-4 flex-1 flex flex-col">
            <label htmlFor="humanize-input" className="sr-only">
              Original text to humanize
            </label>
            <textarea
              id="humanize-input"
              rows={9}
              value={inputText}
              disabled={loading}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste robotic, rigid, or AI-generated text here (up to 8,000 characters)..."
              className="w-full bg-transparent text-[#15152B] placeholder:text-[#9596AA] text-sm leading-relaxed focus:outline-none resize-y min-h-[190px]"
            />
          </div>

          {/* Configuration Controls Bar */}
          <div className="p-4 bg-[#FAF9FF]/80 border-t border-[#8E84E0]/15 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
              {/* Compact Context Dropdown */}
              <ContextSelector value={context} onChange={setContext} disabled={loading} />

              {/* Compact Tone Segmented Control */}
              <ToneSelector value={tone} onChange={setTone} disabled={loading} />
            </div>

            {/* Collapsible Advanced Instructions */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#6F7088] hover:text-[#15152B] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6654F5]"
              >
                <SlidersHorizontal className="w-3 h-3 text-[#6654F5]" />
                <span>Custom Instructions (Optional)</span>
                {showAdvanced ? (
                  <ChevronUp className="w-3 h-3 text-[#9596AA]" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-[#9596AA]" />
                )}
              </button>

              {showAdvanced && (
                <div className="mt-2 animate-fade-in">
                  <input
                    type="text"
                    value={customInstructions}
                    disabled={loading}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="e.g. Keep bullet format; emphasize candidate empathy."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#8E84E0]/25 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6654F5] text-[#15152B] placeholder:text-[#9596AA]"
                  />
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-900 animate-fade-in"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="flex-1 leading-snug">{error}</span>
              </div>
            )}

            {/* Primary Action Button */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <div className="text-[11px] text-[#9596AA] hidden sm:block">
                Truth Guard verified
              </div>

              <button
                type="button"
                onClick={() => handleHumanize()}
                disabled={loading || !inputText.trim()}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#6654F5] via-[#7563FF] to-[#8A7CFF] hover:from-[#5542E5] hover:to-[#7869FF] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-button-primary hover:shadow-[0_4px_16px_rgba(102,84,245,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6654F5] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Humanizing text...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Humanize Text</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT PANEL: OUTPUT WORKSPACE & TRUTH GUARD AUDIT        */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-[#8E84E0]/25 shadow-card flex flex-col overflow-hidden min-w-0">
          {/* Right Panel Header */}
          <div className="bg-[#FAF9FF] px-4 py-2.5 border-b border-[#8E84E0]/15 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#6654F5]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#15152B]">
                Humanized Output
              </span>
            </div>

            {/* Actions Bar if result exists */}
            {result && (
              <div className="flex items-center gap-1.5">
                {/* Diff Toggle */}
                <button
                  type="button"
                  onClick={() => setShowDiff(!showDiff)}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 border transition-colors ${
                    showDiff
                      ? 'bg-[#EBE8FF] text-[#5542E5] border-[#6654F5]/30'
                      : 'bg-white text-[#6F7088] border-[#8E84E0]/20 hover:text-[#15152B]'
                  }`}
                  title="Highlight differences"
                >
                  <Eye className="w-3 h-3 text-[#6654F5]" />
                  <span className="hidden sm:inline">Diff</span>
                </button>

                {/* Save to History */}
                <button
                  type="button"
                  onClick={handleSaveToHistory}
                  disabled={saving || saveSuccess}
                  className="px-2 py-1 rounded-md text-[11px] font-semibold bg-white text-[#6F7088] border border-[#8E84E0]/20 hover:text-[#15152B] flex items-center gap-1 transition-colors"
                  title="Save rewrite to cloud history"
                >
                  {saving ? (
                    <Loader2 className="w-3 h-3 animate-spin text-[#6654F5]" />
                  ) : saveSuccess ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <BookmarkPlus className="w-3 h-3 text-[#6654F5]" />
                  )}
                  <span className="hidden sm:inline">{saveSuccess ? 'Saved' : 'Save'}</span>
                </button>

                {/* Retry Button */}
                <button
                  type="button"
                  onClick={() => handleHumanize()}
                  disabled={loading}
                  className="px-2 py-1 rounded-md text-[11px] font-semibold bg-white text-[#6F7088] border border-[#8E84E0]/20 hover:text-[#15152B] flex items-center gap-1 transition-colors"
                  title="Generate another rewrite"
                >
                  <RotateCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Retry</span>
                </button>

                {/* Copy Button */}
                <button
                  type="button"
                  onClick={() => copyToClipboard(result.humanizedText)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#6654F5] hover:bg-[#5542E5] text-white flex items-center gap-1 transition-colors shadow-2xs"
                  title="Copy rewritten output to clipboard"
                >
                  {copiedOutput ? (
                    <>
                      <Check className="w-3 h-3 text-white" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-white" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Panel Main Body */}
          <div className="p-4 flex-1 flex flex-col justify-between space-y-4 min-h-[300px]">
            {/* Real Result Display */}
            {result ? (
              <div className="space-y-4">
                {/* Text Output Box */}
                <div className="p-4 rounded-xl bg-[#FAF9FF]/40 border border-[#8E84E0]/15 whitespace-pre-wrap text-sm text-[#15152B] leading-relaxed font-sans min-h-[180px]">
                  {showDiff
                    ? renderHighlightedDiff(result.originalText, result.humanizedText)
                    : result.humanizedText}
                </div>

                {/* Word Stats Bar */}
                <div className="flex items-center justify-between text-xs text-[#6F7088] px-1">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-[#6654F5]" />
                      <strong>{result.stats.rewrittenWords}</strong> words
                    </span>
                    <span className="text-[#8E84E0]/30">·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#9596AA]" />
                      ~{result.stats.readingTimeSeconds}s read
                    </span>
                  </div>

                  {/* Flagged Issue Quick Banner & Safer Rewrite Action */}
                  {hasIssues && (
                    <button
                      type="button"
                      onClick={handleSaferRewrite}
                      disabled={loading}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-lg transition-colors"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Try Safer Rewrite</span>
                    </button>
                  )}
                </div>

                {saveError && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                    {saveError}
                  </div>
                )}

                {/* Compact Truth Guard Audit Component */}
                <TruthGuardPanel
                  truthGuard={result.truthGuard}
                  loading={false}
                />
              </div>
            ) : loading ? (
              /* Loading State */
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-3">
                <Loader2 className="w-7 h-7 animate-spin text-[#6654F5]" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#15152B]">
                    Refining words & analyzing cadence...
                  </p>
                  <p className="text-[11px] text-[#6F7088]">
                    Gemini 3.8 Flash rewriting with active Truth Guard verification
                  </p>
                </div>
              </div>
            ) : (
              /* Minimal Clean Empty State */
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-2 border border-dashed border-[#8E84E0]/25 rounded-xl bg-[#FAF9FF]/40">
                <Sparkles className="w-6 h-6 text-[#8E84E0]/60" />
                <p className="text-xs font-semibold text-[#15152B]">
                  Output will appear here
                </p>
                <p className="text-[11px] text-[#6F7088] max-w-xs">
                  Enter or select a draft on the left, then click Humanize Text.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
