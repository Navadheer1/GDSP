'use client';

import React, { useState } from 'react';
import { HumanizeResponse } from '@/types';
import {
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Clock,
  FileText,
  BookmarkPlus,
  Loader2,
  ShieldAlert,
  Eye,
  Sliders,
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/authContext';
import { saveRewriteHistory } from '@/lib/firebase/history';

interface ResultsComparisonProps {
  result: HumanizeResponse;
  onRetry: () => void;
  onSaferRewrite?: () => void;
  onSaved?: () => void;
  isRetrying?: boolean;
}

/**
 * Lightweight tokenized diff highlight between original and rewritten text
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
          className="bg-brand-50 text-brand-900 border-b-2 border-brand-300 font-semibold px-0.5 rounded-xs"
        >
          {chunk}
        </span>
      );
    }
    return <span key={idx}>{chunk}</span>;
  });
}

export default function ResultsComparison({
  result,
  onRetry,
  onSaferRewrite,
  onSaved,
  isRetrying,
}: ResultsComparisonProps) {
  const { user } = useAuth();
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedHumanized, setCopiedHumanized] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const hasIssues = !result.truthGuard.passed || result.truthGuard.status !== 'verified';

  const copyToClipboard = async (text: string, isOriginal: boolean) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isOriginal) {
        setCopiedOriginal(true);
        setTimeout(() => setCopiedOriginal(false), 2000);
      } else {
        setCopiedHumanized(true);
        setTimeout(() => setCopiedHumanized(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSaveToHistory = async () => {
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
      if (onSaved) onSaved();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Save history error:', err);
      setSaveError('Failed to save to Firestore. Check connection.');
    } finally {
      setSaving(false);
    }
  };

  const wordDelta = result.stats.rewrittenWords - result.stats.originalWords;

  return (
    <div className="space-y-4">
      {/* Verification Warning / Action Banner if issues found */}
      {hasIssues && (
        <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-xs">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-amber-950">
                Factual or Meaning Discrepancy Flagged
              </strong>
              <span className="text-amber-800 leading-relaxed">
                {result.truthGuard.summary}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onSaferRewrite && (
              <button
                type="button"
                onClick={onSaferRewrite}
                disabled={isRetrying}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold transition flex items-center gap-1.5 shadow-xs"
              >
                {isRetrying ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sliders className="w-3.5 h-3.5" />
                )}
                <span>Try Safer Rewrite</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Metrics Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-brand-600" />
            <span>
              Words:{' '}
              <strong className="text-slate-800 font-semibold">
                {result.stats.originalWords}
              </strong>{' '}
              <ArrowRight className="inline w-3 h-3 text-slate-400" />{' '}
              <strong className="text-slate-800 font-semibold">
                {result.stats.rewrittenWords}
              </strong>{' '}
              <span
                className={`text-[10px] font-bold ${
                  wordDelta < 0 ? 'text-emerald-600' : 'text-slate-500'
                }`}
              >
                ({wordDelta > 0 ? `+${wordDelta}` : wordDelta})
              </span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-200 pl-4">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>
              Reading Time: <strong>~{result.stats.readingTimeSeconds}s</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Diff Highlighting */}
          <button
            type="button"
            onClick={() => setShowDiff(!showDiff)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
              showDiff
                ? 'bg-brand-50 border-brand-300 text-brand-700'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-brand-600" />
            <span>{showDiff ? 'Showing Changes' : 'Highlight Changes'}</span>
          </button>

          {/* Save to History Button */}
          <button
            type="button"
            onClick={handleSaveToHistory}
            disabled={saving || saveSuccess}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition ${
              saveSuccess
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <BookmarkPlus className="w-3.5 h-3.5 text-brand-600" />
            )}
            <span>{saveSuccess ? 'Saved!' : 'Save to History'}</span>
          </button>

          {/* Try Again / Retry Button */}
          <button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition disabled:opacity-50"
            title="Generate a fresh rewrite"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Retrying...' : 'Try Again'}</span>
          </button>
        </div>
      </div>

      {saveError && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
          {saveError}
        </div>
      )}

      {/* Side-by-side or stacked text comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Original Text Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Original Text
              </h4>
            </div>
            <button
              onClick={() => copyToClipboard(result.originalText, true)}
              className="text-slate-500 hover:text-slate-800 p-1 rounded-md hover:bg-slate-200/50 transition flex items-center gap-1 text-[11px]"
              title="Copy original"
            >
              {copiedOriginal ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="p-4 flex-1 whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-normal min-h-[160px]">
            {result.originalText}
          </div>
        </div>

        {/* Humanized Text Card */}
        <div className="bg-white rounded-2xl border-2 border-brand-500/30 ring-4 ring-brand-50/50 shadow-sm flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-brand-50 to-indigo-50/60 px-4 py-3 border-b border-brand-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-900">
                Humanized Output
              </h4>
            </div>
            <button
              onClick={() => copyToClipboard(result.humanizedText, false)}
              className="bg-brand-600 hover:bg-brand-700 text-white px-2.5 py-1 rounded-lg shadow-sm transition flex items-center gap-1 text-[11px] font-semibold"
              title="Copy rewritten"
            >
              {copiedHumanized ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Rewrite</span>
                </>
              )}
            </button>
          </div>
          <div className="p-4 flex-1 whitespace-pre-wrap text-sm text-navy-900 font-medium leading-relaxed min-h-[160px] selection:bg-brand-200">
            {showDiff
              ? renderHighlightedDiff(result.originalText, result.humanizedText)
              : result.humanizedText}
          </div>
        </div>
      </div>
    </div>
  );
}
