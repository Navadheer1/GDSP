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
        <div className="p-4 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-subtle">
          <div className="flex items-start gap-3">
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
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold transition-all duration-150 flex items-center gap-1.5 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
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
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-[#8E84E0]/20 shadow-card text-xs text-[#6F7088]">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#6654F5]" />
            <span>
              Words:{' '}
              <strong className="text-[#15152B] font-semibold">
                {result.stats.originalWords}
              </strong>{' '}
              <ArrowRight className="inline w-3 h-3 text-[#9596AA]" />{' '}
              <strong className="text-[#15152B] font-semibold">
                {result.stats.rewrittenWords}
              </strong>{' '}
              <span
                className={`text-[10px] font-bold ${
                  wordDelta < 0 ? 'text-emerald-600' : 'text-[#6F7088]'
                }`}
              >
                ({wordDelta > 0 ? `+${wordDelta}` : wordDelta})
              </span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 border-l border-[#8E84E0]/20 pl-4">
            <Clock className="w-4 h-4 text-[#9596AA]" />
            <span>
              Reading Time: <strong className="text-[#15152B]">~{result.stats.readingTimeSeconds}s</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Diff Highlighting */}
          <button
            type="button"
            onClick={() => setShowDiff(!showDiff)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6654F5] ${
              showDiff
                ? 'bg-[#EBE8FF] border-[#6654F5]/40 text-[#5542E5]'
                : 'bg-white border-[#8E84E0]/20 hover:bg-[#F4F2FF] text-[#6F7088] hover:text-[#15152B]'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-[#6654F5]" />
            <span>{showDiff ? 'Showing Changes' : 'Highlight Changes'}</span>
          </button>

          {/* Save to History Button */}
          <button
            type="button"
            onClick={handleSaveToHistory}
            disabled={saving || saveSuccess}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6654F5] transition-all duration-150 ${
              saveSuccess
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-white border-[#8E84E0]/20 hover:bg-[#F4F2FF] text-[#6F7088] hover:text-[#15152B]'
            }`}
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6654F5]" />
            ) : saveSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <BookmarkPlus className="w-3.5 h-3.5 text-[#6654F5]" />
            )}
            <span>{saveSuccess ? 'Saved!' : 'Save to History'}</span>
          </button>

          {/* Try Again / Retry Button */}
          <button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#8E84E0]/20 bg-white hover:bg-[#F4F2FF] text-[#6F7088] hover:text-[#15152B] text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6654F5] transition-all duration-150 disabled:opacity-50"
            title="Generate a fresh rewrite"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-[#6F7088] ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Retrying...' : 'Try Again'}</span>
          </button>
        </div>
      </div>

      {saveError && (
        <div className="p-3 bg-amber-50 border border-amber-200/90 rounded-xl text-xs text-amber-900 animate-fade-in">
          {saveError}
        </div>
      )}

      {/* Balanced Two-Column Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Original Text Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-[#8E84E0]/20 shadow-card flex flex-col overflow-hidden">
          <div className="bg-[#FAF9FF] px-5 py-3 border-b border-[#8E84E0]/15 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9596AA]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6F7088]">
                Original Draft
              </h4>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(result.originalText, true)}
              className="text-[#6F7088] hover:text-[#15152B] p-1.5 rounded-lg hover:bg-[#F4F2FF] transition-colors flex items-center gap-1 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6654F5]"
              title="Copy original"
            >
              {copiedOriginal ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="p-5 flex-1 whitespace-pre-wrap text-sm text-[#6F7088] leading-relaxed font-normal min-h-[170px]">
            {result.originalText}
          </div>
        </div>

        {/* Humanized Text Card */}
        <div className="bg-white rounded-2xl border-2 border-[#6654F5]/35 shadow-[0_12px_32px_-4px_rgba(102,84,245,0.15)] flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-[#F4F2FF] to-[#FAF9FF] px-5 py-3 border-b border-[#6654F5]/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#6654F5]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#15152B]">
                Humanized Output
              </h4>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(result.humanizedText, false)}
              className="bg-[#6654F5] hover:bg-[#5542E5] text-white px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6654F5]"
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
          <div className="p-5 flex-1 whitespace-pre-wrap text-sm text-[#15152B] font-medium leading-relaxed min-h-[170px] selection:bg-[#EBE8FF]">
            {showDiff
              ? renderHighlightedDiff(result.originalText, result.humanizedText)
              : result.humanizedText}
          </div>
        </div>
      </div>
    </div>
  );
}
