'use client';

import React, { useState } from 'react';
import ContextSelector from './ContextSelector';
import ToneSelector from './ToneSelector';
import ResultsComparison from './ResultsComparison';
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
} from 'lucide-react';

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

export default function HumanizeWorkspace({
  onSavedToHistory,
  loadedHistoryItem,
}: HumanizeWorkspaceProps) {
  const [inputText, setInputText] = useState('');
  const [context, setContext] = useState<WritingContext>('recruiter-feedback');
  const [tone, setTone] = useState<WritingTone>('professional');
  const [customInstructions, setCustomInstructions] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HumanizeResponse | null>(null);

  // Sync if an item was opened from the History drawer
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
    const safeInstruction = 'STRICT FACTUAL ADHERENCE: Strictly retain all numbers, dates, and named entities without altering any phrasing of metrics, and retain all uncertainty indicators intact.';
    setCustomInstructions(safeInstruction);
    setShowAdvanced(true);
    handleHumanize(safeInstruction);
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    setError(null);
  };

  const loadSample = (sample: typeof SAMPLE_TEXTS[0]) => {
    setInputText(sample.text);
    setContext(sample.context);
    setTone(sample.tone);
    setError(null);
  };

  const inputCharCount = inputText.length;
  const inputWordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-8">
      {/* Workspace Input Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-6">
        {/* Sample text picker pills */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Quick Samples:
            </span>
            <span className="text-[11px] text-slate-400">Click any sample to autofill</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {SAMPLE_TEXTS.map((sample) => {
              const isCurrent = inputText === sample.text;
              return (
                <button
                  key={sample.label}
                  type="button"
                  disabled={loading}
                  onClick={() => loadSample(sample)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                    isCurrent
                      ? 'bg-brand-100 text-brand-900 border border-brand-300 shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200/90 text-slate-700 hover:text-slate-900'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {sample.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Input Area */}
        <div className="relative">
          <label htmlFor="humanize-input" className="sr-only">
            Text to humanize
          </label>
          <textarea
            id="humanize-input"
            rows={5}
            value={inputText}
            disabled={loading}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste stiff, robotic, overly formal, or repetitive text here (up to 8,000 characters)..."
            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition resize-y min-h-[140px]"
          />

          <div className="flex items-center justify-between mt-2 text-xs text-slate-400 px-1">
            <div className="flex items-center gap-2.5">
              <span className="font-medium text-slate-600">{inputWordCount} words</span>
              <span>•</span>
              <span
                className={`font-medium ${
                  inputCharCount > 7500
                    ? 'text-amber-600 font-semibold'
                    : 'text-slate-500'
                }`}
              >
                {inputCharCount} / 8,000 characters
              </span>
            </div>

            {inputText && (
              <button
                type="button"
                onClick={handleClear}
                disabled={loading}
                className="text-slate-400 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded px-1.5 py-0.5 flex items-center gap-1 transition"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Clear text</span>
              </button>
            )}
          </div>
        </div>

        {/* Target Context Selector */}
        <ContextSelector value={context} onChange={setContext} disabled={loading} />

        {/* Target Tone Selector */}
        <ToneSelector value={tone} onChange={setTone} disabled={loading} />

        {/* Collapsible Advanced Guidance */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded px-1 py-0.5 transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
            <span>Additional Custom Instructions (Optional)</span>
            {showAdvanced ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showAdvanced && (
            <div className="mt-3">
              <label htmlFor="custom-instructions" className="sr-only">
                Custom instructions
              </label>
              <input
                id="custom-instructions"
                type="text"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g. Ensure bullet points are kept; keep tone particularly supportive."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-navy-900 placeholder:text-slate-400 transition"
              />
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="p-4 bg-red-50/90 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-800 shadow-xs"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1">
              <strong className="font-semibold block text-red-900 mb-0.5">Execution Error</strong>
              <p className="leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <div className="text-[11px] text-slate-400 hidden sm:block">
            Gemini 3.8 Flash + Dual Verification Engine
          </div>
          <button
            type="button"
            onClick={() => handleHumanize()}
            disabled={loading || !inputText.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 active:from-brand-800 active:to-indigo-800 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Humanizing with Gemini & Guarding Truth...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Humanize Text</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Comparison & Truth Guard Section */}
      {(result || loading) && (
        <div className="space-y-6 animate-fade-in">
          {result && (
            <ResultsComparison
              result={result}
              onRetry={() => handleHumanize()}
              onSaferRewrite={handleSaferRewrite}
              onSaved={onSavedToHistory}
              isRetrying={loading}
            />
          )}

          <TruthGuardPanel
            truthGuard={result?.truthGuard || null}
            loading={loading && !result}
          />
        </div>
      )}
    </div>
  );
}
