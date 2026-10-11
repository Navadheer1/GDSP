'use client';

import React, { useState } from 'react';
import { X, Check, ArrowRight, Sparkles, SplitSquareVertical, Columns } from 'lucide-react';

interface DiffComparisonModalProps {
  isOpen: boolean;
  actionTitle: string;
  originalText: string;
  revisedText: string;
  revisedHtml?: string;
  isEntireDocument?: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

export function DiffComparisonModal({
  isOpen,
  actionTitle,
  originalText,
  revisedText,
  isEntireDocument = false,
  onAccept,
  onCancel,
}: DiffComparisonModalProps) {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#15152B]/50 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl max-w-4xl w-full border border-[#8E84E0]/20 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[88vh] animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAF9FF] border-b border-[#8E84E0]/15 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EBE8FF] text-[#5542E5] flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#15152B]">
                Review AI Changes: {actionTitle}
              </h3>
              <p className="text-xs text-[#6F7088]">
                {isEntireDocument
                  ? 'Changes will apply to the entire document upon confirmation.'
                  : 'Changes will replace the selected section upon confirmation.'}
              </p>
            </div>
          </div>

          {/* View Mode Toggle & Close */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-white border border-[#8E84E0]/20 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('side-by-side')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  viewMode === 'side-by-side'
                    ? 'bg-[#EBE8FF] text-[#5542E5] font-semibold'
                    : 'text-[#6F7088] hover:text-[#15152B]'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Side by Side</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('unified')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  viewMode === 'unified'
                    ? 'bg-[#EBE8FF] text-[#5542E5] font-semibold'
                    : 'text-[#6F7088] hover:text-[#15152B]'
                }`}
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
                <span>Stacked</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 text-[#6F7088] hover:text-[#15152B] rounded-lg hover:bg-[#F4F2FF] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Comparison View */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {viewMode === 'side-by-side' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original */}
              <div className="flex flex-col rounded-xl border border-rose-200/80 bg-rose-50/20 overflow-hidden">
                <div className="px-3.5 py-2 bg-rose-50 border-b border-rose-200 text-xs font-bold text-rose-800 flex items-center justify-between">
                  <span>Original Text</span>
                  <span className="text-[10px] font-medium bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                    Preserved
                  </span>
                </div>
                <div className="p-4 text-xs sm:text-sm text-[#15152B] leading-relaxed whitespace-pre-wrap font-sans max-h-[380px] overflow-y-auto">
                  {originalText || '(Empty text)'}
                </div>
              </div>

              {/* Revised */}
              <div className="flex flex-col rounded-xl border border-emerald-200/80 bg-emerald-50/20 overflow-hidden">
                <div className="px-3.5 py-2 bg-emerald-50 border-b border-emerald-200 text-xs font-bold text-emerald-800 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> AI Revised Text
                  </span>
                  <span className="text-[10px] font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    Proposed
                  </span>
                </div>
                <div className="p-4 text-xs sm:text-sm text-[#15152B] leading-relaxed whitespace-pre-wrap font-sans max-h-[380px] overflow-y-auto">
                  {revisedText || '(Empty output)'}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Original */}
              <div className="rounded-xl border border-rose-200 bg-rose-50/30 overflow-hidden">
                <div className="px-3.5 py-2 bg-rose-50 border-b border-rose-200 text-xs font-bold text-rose-800">
                  Original Text
                </div>
                <div className="p-4 text-xs sm:text-sm text-[#15152B] leading-relaxed whitespace-pre-wrap">
                  {originalText || '(Empty text)'}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center text-[#6654F5]">
                <div className="w-7 h-7 rounded-full bg-[#EBE8FF] flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>

              {/* Revised */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 overflow-hidden">
                <div className="px-3.5 py-2 bg-emerald-50 border-b border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Proposed Revision
                </div>
                <div className="p-4 text-xs sm:text-sm text-[#15152B] leading-relaxed whitespace-pre-wrap font-medium">
                  {revisedText || '(Empty output)'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#FAF9FF] border-t border-[#8E84E0]/15 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-[#6F7088] text-center sm:text-left">
            Your original text will not be altered unless you click Accept.
          </span>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-[#6F7088] hover:text-[#15152B] bg-white hover:bg-[#F4F2FF] border border-[#8E84E0]/25 rounded-xl transition-colors"
            >
              Cancel & Keep Original
            </button>
            <button
              type="button"
              onClick={onAccept}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#6654F5] to-[#8A7CFF] hover:from-[#5542E5] hover:to-[#7869FF] rounded-xl shadow-[0_2px_10px_rgba(102,84,245,0.3)] transition-all active:scale-[0.98]"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept & Apply Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
