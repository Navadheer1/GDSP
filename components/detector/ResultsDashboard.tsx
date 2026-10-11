'use client';

import React, { useState } from 'react';
import { DetectorAnalysisResult, PassageAnalysis } from '@/types/detector';
import {
  ShieldAlert,
  Sparkles,
  UserCheck,
  HelpCircle,
  BarChart2,
  ListFilter,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  Quote,
  CheckCircle2,
} from 'lucide-react';

interface ResultsDashboardProps {
  result: DetectorAnalysisResult;
  onSelectPassage?: (passageText: string) => void;
}

export function ResultsDashboard({ result, onSelectPassage }: ResultsDashboardProps) {
  const [showDetailedSentences, setShowDetailedSentences] = useState(false);
  const [activePassageId, setActivePassageId] = useState<string | null>(null);

  const {
    assessment,
    assessmentLabel,
    summaryExplanation,
    writingCharacteristics: stats,
    passages,
    sentences,
    limitations,
  } = result;

  // Restrained, non-alarmist assessment badge colors
  const getAssessmentStyle = () => {
    switch (assessment) {
      case 'ai-like':
        return {
          container: 'bg-[#FAF5FF] border-[#D8B4FE] text-[#581C87]',
          icon: <Sparkles className="w-5 h-5 text-[#9333EA]" />,
          badge: 'bg-[#F3E8FF] text-[#7E22CE] border border-[#D8B4FE]',
          note: 'Stylistic patterns exhibit notable syntactic uniformity and formulaic transitions typical of machine-generated drafts.',
        };
      case 'human-like':
        return {
          container: 'bg-[#F0FDF4] border-[#86EFAC] text-[#14532D]',
          icon: <UserCheck className="w-5 h-5 text-[#16A34A]" />,
          badge: 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]',
          note: 'Stylistic patterns exhibit natural sentence length variation (burstiness) and organic transitional flow characteristic of human composition.',
        };
      default:
        return {
          container: 'bg-[#F8FAFC] border-[#CBD5E1] text-[#1E293B]',
          icon: <HelpCircle className="w-5 h-5 text-[#64748B]" />,
          badge: 'bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]',
          note: 'The text exhibits a balanced mix of uniform and varied patterns, or the sample size provides insufficient separation.',
        };
    }
  };

  const style = getAssessmentStyle();

  const handlePassageClick = (p: PassageAnalysis) => {
    setActivePassageId(p.id);
    if (onSelectPassage) {
      onSelectPassage(p.text);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="analysis-results">
      {/* 1. OVERALL ASSESSMENT CARD */}
      <div className={`p-6 rounded-2xl border ${style.container} shadow-xs space-y-3`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/90 shadow-2xs flex items-center justify-center shrink-0">
              {style.icon}
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-75">
                Heuristic Writing-Pattern Assessment
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
                {assessmentLabel}
              </h3>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-auto ${style.badge}`}>
            Pattern Estimate
          </span>
        </div>

        <p className="text-xs sm:text-sm leading-relaxed opacity-90 pt-1 font-medium">
          {summaryExplanation}
        </p>
        <p className="text-[11px] opacity-75 font-normal">
          {style.note}
        </p>
      </div>

      {/* 2. MEASURED WRITING CHARACTERISTICS */}
      <div className="p-6 bg-white rounded-2xl border border-[#8E84E0]/20 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#8E84E0]/15 pb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#6654F5]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#15152B]">
              Measured Writing Characteristics
            </h4>
          </div>
          <span className="text-[11px] text-[#9596AA]">Calculated metrics</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Sentence Variation (CV) */}
          <div className="p-3.5 rounded-xl bg-[#FAF9FF] border border-[#8E84E0]/15 space-y-1">
            <span className="text-[10px] font-semibold text-[#6F7088] uppercase tracking-wider">
              Cadence Variation (CV)
            </span>
            <div className="text-lg sm:text-xl font-extrabold text-[#15152B]">
              {stats.sentenceVariationCoefficient}
            </div>
            <p className="text-[10px] text-[#9596AA] leading-tight">
              {stats.sentenceVariationCoefficient < 0.35
                ? 'Low burstiness (uniform lengths)'
                : 'High burstiness (varied lengths)'}
            </p>
          </div>

          {/* Average Sentence Length */}
          <div className="p-3.5 rounded-xl bg-[#FAF9FF] border border-[#8E84E0]/15 space-y-1">
            <span className="text-[10px] font-semibold text-[#6F7088] uppercase tracking-wider">
              Avg Sentence Length
            </span>
            <div className="text-lg sm:text-xl font-extrabold text-[#15152B]">
              {stats.averageSentenceLength}{' '}
              <span className="text-xs font-normal text-[#6F7088]">words</span>
            </div>
            <p className="text-[10px] text-[#9596AA] leading-tight">
              Std Dev: ±{stats.sentenceLengthStdDev} words
            </p>
          </div>

          {/* Vocabulary Diversity (TTR) */}
          <div className="p-3.5 rounded-xl bg-[#FAF9FF] border border-[#8E84E0]/15 space-y-1">
            <span className="text-[10px] font-semibold text-[#6F7088] uppercase tracking-wider">
              Vocabulary Diversity
            </span>
            <div className="text-lg sm:text-xl font-extrabold text-[#15152B]">
              {Math.round(stats.vocabularyDiversityRatio * 100)}%
            </div>
            <p className="text-[10px] text-[#9596AA] leading-tight">
              Ratio of unique to total tokens
            </p>
          </div>

          {/* Structural Units */}
          <div className="p-3.5 rounded-xl bg-[#FAF9FF] border border-[#8E84E0]/15 space-y-1">
            <span className="text-[10px] font-semibold text-[#6F7088] uppercase tracking-wider">
              Analyzed Units
            </span>
            <div className="text-lg sm:text-xl font-extrabold text-[#15152B]">
              {stats.totalSentences}{' '}
              <span className="text-xs font-normal text-[#6F7088]">sentences</span>
            </div>
            <p className="text-[10px] text-[#9596AA] leading-tight">
              Across {stats.totalParagraphs} paragraph(s)
            </p>
          </div>
        </div>

        {/* Repetitive Transitions & Phrases (if found) */}
        {(stats.formulaicTransitionsFound.length > 0 || stats.repeatedPhrases.length > 0) && (
          <div className="pt-2 border-t border-[#8E84E0]/15 space-y-2">
            <span className="text-[11px] font-bold text-[#6F7088] uppercase tracking-wider">
              Detected Repetitions & Transitions
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              {stats.formulaicTransitionsFound.map((t) => (
                <span
                  key={t.transition}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF9FF] border border-[#8E84E0]/20 text-[#15152B]"
                >
                  <span className="font-semibold">&ldquo;{t.transition}&rdquo;</span>
                  <span className="text-[10px] font-bold text-[#6654F5] bg-[#EBE8FF] px-1.5 py-0.2 rounded-full">
                    ×{t.count}
                  </span>
                </span>
              ))}

              {stats.repeatedPhrases.map((p) => (
                <span
                  key={p.phrase}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF9FF] border border-[#8E84E0]/20 text-[#6F7088]"
                >
                  <span className="font-mono text-[11px]">&ldquo;{p.phrase}&rdquo;</span>
                  <span className="text-[10px] font-semibold text-[#6F7088]">
                    ({p.count})
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. PASSAGE-LEVEL ANALYSIS */}
      {passages.length > 0 && (
        <div className="p-6 bg-white rounded-2xl border border-[#8E84E0]/20 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#8E84E0]/15 pb-3">
            <div className="flex items-center gap-2">
              <Quote className="w-4 h-4 text-[#6654F5]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#15152B]">
                Notable Writing Passages
              </h4>
            </div>
            <span className="text-[11px] text-[#9596AA]">Click passage to locate</span>
          </div>

          <div className="space-y-3">
            {passages.map((p) => {
              const isSelected = activePassageId === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => handlePassageClick(p)}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#EBE8FF]/40 border-[#6654F5] shadow-xs'
                      : 'bg-[#FAF9FF]/80 border-[#8E84E0]/20 hover:bg-[#FAF9FF] hover:border-[#6654F5]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-[#15152B] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6654F5]" />
                      {p.title}
                    </span>
                    <span className="text-[10px] font-semibold uppercase text-[#6654F5] bg-[#EBE8FF] px-2 py-0.5 rounded-full">
                      {p.patternType.replace('-', ' ')}
                    </span>
                  </div>

                  <blockquote className="italic text-[#15152B] pl-2.5 border-l-2 border-[#6654F5]/40 my-2 leading-relaxed">
                    &ldquo;{p.text}&rdquo;
                  </blockquote>

                  <p className="text-[11px] text-[#6F7088] leading-relaxed">
                    {p.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. COLLAPSIBLE SENTENCE-BY-SENTENCE CADENCE */}
      {sentences.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#8E84E0]/20 shadow-xs overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDetailedSentences(!showDetailedSentences)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#FAF9FF] transition-colors"
          >
            <div className="flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-[#6654F5]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#15152B]">
                Sentence Cadence Breakdown ({sentences.length} sentences)
              </h4>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#6F7088]">
              <span>{showDetailedSentences ? 'Collapse' : 'Expand'}</span>
              {showDetailedSentences ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showDetailedSentences && (
            <div className="p-6 border-t border-[#8E84E0]/15 space-y-2 max-h-96 overflow-y-auto">
              <p className="text-[11px] text-[#6F7088] mb-3">
                Inspect individual sentence lengths to examine cadence burstiness vs. structural uniformity.
              </p>

              {sentences.map((s) => (
                <div
                  key={s.index}
                  className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-[#FAF9FF] border border-[#8E84E0]/15 text-xs"
                >
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    <span className="font-mono text-[10px] text-[#9596AA] pt-0.5 shrink-0">
                      #{s.index + 1}
                    </span>
                    <p className="text-[#15152B] leading-relaxed break-words">
                      {s.text}
                    </p>
                  </div>

                  <span className="text-[10px] font-semibold text-[#6654F5] bg-[#EBE8FF] px-2 py-0.5 rounded-md shrink-0">
                    {s.wordCount} words
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. LIMITATIONS & UNCERTAINTY NOTICE */}
      <div className="p-5 rounded-2xl bg-[#FFFBEB] border border-amber-200 text-amber-900 space-y-2">
        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Understanding Detection Limitations</span>
        </div>

        <ul className="text-xs space-y-1.5 list-disc list-inside leading-relaxed text-amber-900/90 font-normal">
          {limitations.map((lim, idx) => (
            <li key={idx}>{lim}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
