'use client';

import React from 'react';
import { TruthGuardResult } from '@/types';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  HelpCircle,
  Binary,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface TruthGuardPanelProps {
  truthGuard: TruthGuardResult | null;
  loading?: boolean;
}

export default function TruthGuardPanel({ truthGuard, loading }: TruthGuardPanelProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-brand-50 rounded-xl text-brand-600 animate-pulse">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-navy-900">Truth Guard Integrity Engine</h3>
            <p className="text-xs text-slate-500">
              Running deterministic checks and AI semantic verification...
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-100 rounded-md animate-pulse w-3/4" />
          <div className="h-4 bg-slate-100 rounded-md animate-pulse w-1/2" />
          <div className="h-4 bg-slate-100 rounded-md animate-pulse w-5/6" />
        </div>
      </div>
    );
  }

  if (!truthGuard) {
    return (
      <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-navy-900">Truth Guard Semantic Shield</h3>
            <p className="text-xs text-slate-500">
              Automatic validation of facts, numbers, dates, and author intent
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed mt-2">
          When you humanize text, Truth Guard runs rigorous dual audits: deterministic regex verification for numbers, dates, and named entities, followed by an independent AI semantic check to confirm no meaning was altered or hallucinated.
        </p>
      </div>
    );
  }

  const { score, passed, summary, deterministicChecks, semanticVerification } = truthGuard;

  // Icon selector based on category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'numbers':
        return <Binary className="w-3.5 h-3.5" />;
      case 'dates':
        return <Calendar className="w-3.5 h-3.5" />;
      case 'entities':
        return <Layers className="w-3.5 h-3.5" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
      {/* Top Score Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              passed
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : truthGuard.status === 'incomplete'
                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                : truthGuard.status === 'warning'
                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}
          >
            {passed ? (
              <ShieldCheck className="w-6 h-6" />
            ) : truthGuard.status === 'failed' ? (
              <XCircle className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-navy-900">Truth Guard Report</h3>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  passed
                    ? 'bg-emerald-100 text-emerald-800'
                    : truthGuard.status === 'incomplete'
                    ? 'bg-amber-100 text-amber-800'
                    : truthGuard.status === 'warning'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {passed
                  ? 'All Integrity Checks Passed'
                  : truthGuard.status === 'incomplete'
                  ? 'Verification Incomplete'
                  : truthGuard.status === 'warning'
                  ? 'Advisory Warnings'
                  : 'Factual Discrepancies Detected'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">{summary}</p>
          </div>
        </div>

        {/* Score Ring / Pill */}
        <div className="flex items-center gap-3 self-end sm:self-auto bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/80">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Fidelity Score
            </span>
            <span
              className={`text-xl font-black ${
                truthGuard.status === 'incomplete'
                  ? 'text-amber-600'
                  : score >= 85
                  ? 'text-emerald-600'
                  : score >= 70
                  ? 'text-amber-600'
                  : 'text-red-600'
              }`}
            >
              {truthGuard.status === 'incomplete' ? `${score}%*` : `${score}%`}
            </span>
            {truthGuard.status === 'incomplete' && (
              <span className="text-[9px] text-amber-600 block">*Partial audit</span>
            )}
          </div>
        </div>
      </div>

      {/* Semantic Check Summary Callout */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-700">
        <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-600" /> AI Semantic Verification
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
              semanticVerification.status === 'verified'
                ? 'bg-emerald-100 text-emerald-700'
                : semanticVerification.status === 'caution'
                ? 'bg-amber-100 text-amber-700'
                : semanticVerification.status === 'incomplete'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {semanticVerification.status}
          </span>
        </div>
        <p className="text-slate-600 leading-relaxed text-[11px]">
          {semanticVerification.semanticExplanation}
        </p>
      </div>

      {/* Granular Checks Grid */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Fidelity & Entity Checks
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {deterministicChecks.map((check) => {
            const isPassed = check.status === 'passed';
            const isWarn = check.status === 'warning';

            return (
              <div
                key={check.id}
                className={`p-3.5 rounded-xl border transition ${
                  isPassed
                    ? 'bg-white border-slate-200'
                    : isWarn
                    ? 'bg-amber-50/60 border-amber-200/90'
                    : 'bg-red-50/60 border-red-200/90'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-navy-900">
                    <span className="text-slate-400">{getCategoryIcon(check.category)}</span>
                    <span>{check.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        isPassed
                          ? 'bg-emerald-100 text-emerald-800'
                          : isWarn
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {check.status}
                    </span>
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isWarn ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{check.details}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transparency Disclaimer */}
      <div className="flex items-start gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
        <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
        <p>
          Truth Guard combines deterministic pattern recognition with semantic auditing to minimize factual errors. As with any AI system, always review important legal, financial, or confidential documents manually before final publication.
        </p>
      </div>
    </div>
  );
}
