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
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/authContext';
import { saveRewriteHistory } from '@/lib/firebase/history';

interface ResultsComparisonProps {
  result: HumanizeResponse;
  onRetry: () => void;
  onSaved?: () => void;
  isRetrying?: boolean;
}

export default function ResultsComparison({
  result,
  onRetry,
  onSaved,
  isRetrying,
}: ResultsComparisonProps) {
  const { user } = useAuth();
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedHumanized, setCopiedHumanized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
          {/* Save to History Button */}
          <button
            onClick={handleSaveToHistory}
            disabled={saving || saveSuccess}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
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

          {/* Retry Button */}
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>Retry</span>
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
            {result.humanizedText}
          </div>
        </div>
      </div>
    </div>
  );
}
